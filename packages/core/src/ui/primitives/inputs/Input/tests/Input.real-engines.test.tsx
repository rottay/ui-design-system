import { readFileSync } from "node:fs";
import { join } from "node:path";

import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import ClassicInput from "../engines/classic";
import ModernInput from "../engines/modern";
import RusticInput from "../engines/rustic";
import { Input } from "..";
import { InputAddon } from "../compound/Addon";
import { InputGroup } from "../compound/Group";
import { InputPassword } from "../compound/Password";
import { InputSearch } from "../compound/Search";
import { InputTextArea } from "../compound/TextArea";
import { renderWithEngine } from "../../../../../tooling/testing/helpers/engine";
import { I18nProvider } from "@/infrastructure/runtime/i18n";
import { compileBrandTheme } from "@/infrastructure/compilers/kernel/runtime/brand-theme";
import { bithireBrandTheme } from "@/foundation/tokens/ts/presentation/brand-themes";
import { themanagementmiamiBrandTheme } from "@/foundation/tokens/ts/presentation/brand-themes/fixtures/themanagementmiami";

describe("Input real engine coverage", () => {
  // WO-CNF-01: `type="hidden"` renders a bare, form-participating input with no
  // wrapper chrome, so server-action forms (e.g. the public apply page's
  // jobIdentifier) receive the value via FormData across every engine.
  it.each([
    ["classic", ClassicInput],
    ["modern", ModernInput],
    ["rustic", RusticInput],
  ] as const)(
    "renders a bare hidden input under the %s engine",
    (_engine, Engine) => {
      const { container } = render(
        <Engine
          type="hidden"
          name="jobIdentifier"
          value="acme-senior-eng"
          data-testid="hidden-field"
        />
      );

      const el = screen.getByTestId("hidden-field") as HTMLInputElement;
      expect(el.tagName).toBe("INPUT");
      expect(el.getAttribute("type")).toBe("hidden");
      expect(el.getAttribute("name")).toBe("jobIdentifier");
      expect(el.value).toBe("acme-senior-eng");
      // Bare passthrough: the hidden input is the only rendered element (no shell,
      // label, or placeholder <style> chrome around it).
      expect(container.querySelectorAll("input").length).toBe(1);
      expect(container.querySelector("label")).toBeNull();
      // A native FormData round trip carries the hidden value.
      const form = document.createElement("form");
      form.appendChild(el.cloneNode(true));
      expect(new FormData(form).get("jobIdentifier")).toBe("acme-senior-eng");
    }
  );

  // WO-CNF-01: `type="file"` renders a bare file picker that forwards its ref
  // (so callers can `.click()` it programmatically) and its native change event
  // (so callers can read `event.target.files`), with no chrome and no value.
  it.each([
    ["classic", ClassicInput],
    ["modern", ModernInput],
    ["rustic", RusticInput],
  ] as const)(
    "renders a bare file input that forwards ref + change event under the %s engine",
    (_engine, Engine) => {
      const ref = React.createRef<HTMLInputElement>();
      const onChange = vi.fn();
      const { container } = render(
        <Engine
          ref={ref}
          type="file"
          name="audio"
          accept="audio/*"
          onChange={onChange}
          style={{ display: "none" }}
          data-testid="file-field"
        />
      );

      const el = screen.getByTestId("file-field") as HTMLInputElement;
      expect(el.tagName).toBe("INPUT");
      expect(el.getAttribute("type")).toBe("file");
      expect(el.getAttribute("accept")).toBe("audio/*");
      expect(el.style.display).toBe("none");
      // Ref forwards to the real file input so callers can trigger it.
      expect(ref.current).toBe(el);
      // Bare passthrough: no wrapper/label chrome.
      expect(container.querySelectorAll("input").length).toBe(1);
      expect(container.querySelector("label")).toBeNull();
      // The DS onChange contract passes (value, event); callers read files off the event.
      fireEvent.change(el, { target: { files: [] } });
      expect(onChange).toHaveBeenCalled();
      expect(onChange.mock.calls[0][1]).toBeTruthy();
    }
  );

  it("covers classic number, password, search, and error branches", async () => {
    const handleChange = vi.fn();
    const handleEnter = vi.fn();

    const { rerender } = render(
      <ClassicInput
        type="number"
        defaultValue="12"
        error
        errorMessage="Capacity is invalid"
        onChange={handleChange}
        aria-label="Capacity"
      />
    );

    const spinbutton = screen.getByRole("spinbutton", { name: "Capacity" });
    fireEvent.change(spinbutton, { target: { value: "34" } });

    expect(handleChange).toHaveBeenCalledWith("34", expect.any(Object));
    expect(screen.getByText("Capacity is invalid")).toBeInTheDocument();

    rerender(
      <ClassicInput
        type="password"
        value="top-secret"
        variant="flushed"
        status="warning"
        errorMessage="Do not leak"
        aria-label="Password"
      />
    );

    expect(screen.getByLabelText("Password")).toHaveValue("top-secret");

    rerender(
      <ClassicInput
        type="search"
        defaultValue="launch"
        clearable
        showCount
        maxLength={20}
        onChange={handleChange}
        onPressEnter={handleEnter}
        aria-label="Search input"
      />
    );

    const searchInput = screen.getByRole("searchbox", { name: "Search input" });
    fireEvent.keyDown(searchInput, { key: "Enter" });
    fireEvent.change(searchInput, { target: { value: "launch week" } });

    expect(handleEnter).toHaveBeenCalled();
    expect(handleChange).toHaveBeenCalledWith(
      "launch week",
      expect.any(Object)
    );
  });

  it("does not leak classic-only number props to the DOM", () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    render(
      <ClassicInput
        type="number"
        defaultValue="12"
        clearable
        showCount
        aria-label="Capacity without prop leaks"
      />
    );

    const joinedErrors = consoleErrorSpy.mock.calls.flat().join(" ");
    expect(joinedErrors).not.toContain("allowClear");
    expect(joinedErrors).not.toContain("showCount");

    consoleErrorSpy.mockRestore();
  });

  it("covers modern wrapper and simple input branches", async () => {
    const handleChange = vi.fn();
    const handleClear = vi.fn();
    const handleEnter = vi.fn();

    const withI18n = (node: React.ReactNode) => (
      <I18nProvider locale="en" fallbackLocale="en">
        {node}
      </I18nProvider>
    );

    const { rerender } = render(
      withI18n(
        <ModernInput
          value="Ada"
          prefix={<span data-testid="modern-prefix">@</span>}
          suffix={<span data-testid="modern-suffix">ok</span>}
          clearable
          showCount
          maxLength={12}
          status="success"
          onChange={handleChange}
          onClear={handleClear}
          onPressEnter={handleEnter}
          aria-label="Modern affix input"
        />
      )
    );

    const affixInput = screen.getByRole("textbox", {
      name: "Modern affix input",
    });
    fireEvent.focus(affixInput);
    fireEvent.keyDown(affixInput, { key: "Enter" });
    fireEvent.click(screen.getByRole("button", { name: /clear/i }));

    await waitFor(() => {
      expect(handleClear).toHaveBeenCalledTimes(1);
    });

    expect(handleEnter).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith("", expect.any(Object));
    expect(screen.getByTestId("modern-prefix")).toBeInTheDocument();
    expect(screen.getByTestId("modern-suffix")).toBeInTheDocument();
    expect(screen.getByText("3/12")).toBeInTheDocument();

    rerender(
      withI18n(
        <ModernInput
          defaultValue="readonly"
          variant="unstyled"
          readOnly
          disabled
          error
          errorMessage="Disabled field"
          aria-label="Modern plain input"
        />
      )
    );

    const plainInput = screen.getByRole("textbox", {
      name: "Modern plain input",
    });
    expect(plainInput).toBeDisabled();
    expect(screen.getByText("Disabled field")).toBeInTheDocument();
  });

  it("covers password/search compounds plus addon/group/text-area helpers", async () => {
    const onSearch = vi.fn();
    const onPressEnter = vi.fn();

    renderWithEngine(
      <div>
        <InputPassword
          engine="rustic"
          defaultValue="launch"
          aria-label="Password field"
        />
        <InputSearch
          engine="rustic"
          value="launch"
          onSearch={onSearch}
          aria-label="Search field"
        />
        <InputTextArea
          defaultValue="Draft"
          maxLength={20}
          showCount
          error
          errorMessage="Needs edits"
          onPressEnter={onPressEnter}
          aria-label="Notes"
        />
      </div>,
      "rustic"
    );

    const toggleButton = await screen.findByRole("button", {
      name: /show password/i,
    });
    fireEvent.click(toggleButton);
    expect(await screen.findByLabelText("Password field")).toHaveAttribute(
      "type",
      "text"
    );

    fireEvent.click(screen.getByRole("button", { name: "Search" }));
    expect(onSearch).toHaveBeenCalledWith("launch");

    const textarea = screen.getByRole("textbox", { name: "Notes" });
    fireEvent.keyDown(textarea, { key: "Enter" });
    expect(onPressEnter).toHaveBeenCalledTimes(1);
    expect(screen.getByText("5/20")).toBeInTheDocument();
    expect(screen.getByText("Needs edits")).toBeInTheDocument();

    const { container, rerender } = render(
      <InputGroup compact size="lg">
        <InputAddon position="before">https://</InputAddon>
        <InputAddon position="after">.com</InputAddon>
      </InputGroup>
    );

    const addons = container.querySelectorAll(".rottay-input-addon");
    const group = container.querySelector(".rottay-input-group");
    expect(group).toHaveAttribute("data-compact", "true");
    expect(group).toHaveAttribute("data-size", "lg");
    expect((addons[0] as HTMLElement).style.borderTopRightRadius).toBe("");
    expect((addons[1] as HTMLElement).style.marginLeft).toBe("");

    const compoundSkin = readFileSync(
      join(
        __dirname,
        "../../../../../foundation/tokens/css/presentation/components/skin/input-compounds.css"
      ),
      "utf8"
    );
    expect(compoundSkin).toContain(
      ".rottay-input-group[data-part='group'][data-compact='true'] > :first-child:not(:last-child)"
    );
    expect(compoundSkin).toContain("border-start-end-radius: 0 !important;");
    expect(compoundSkin).toContain("border-end-end-radius: 0 !important;");
    expect(compoundSkin).toContain(
      "margin-inline-start: var(--ds-input-group-overlap"
    );

    rerender(
      <InputGroup compact={false} size="sm">
        <InputAddon position="before" variant="transparent">
          prefix
        </InputAddon>
        <InputAddon position="after">suffix</InputAddon>
      </InputGroup>
    );

    const nonCompactAddons = container.querySelectorAll(".rottay-input-addon");
    expect(container.querySelector(".rottay-input-group")).toHaveAttribute(
      "data-compact",
      "false"
    );
    expect(nonCompactAddons[0]).toHaveAttribute("data-variant", "transparent");
    expect(nonCompactAddons[1]).toHaveAttribute("data-size", "sm");
    expect((nonCompactAddons[1] as HTMLElement).style.marginLeft).toBe("");
  });

  it("covers textarea focus and style branches directly", () => {
    const handleFocus = vi.fn();
    const handleBlur = vi.fn();

    render(
      <InputTextArea
        defaultValue="Ops"
        variant="filled"
        status="warning"
        rows={5}
        resize={false}
        onFocus={handleFocus}
        onBlur={handleBlur}
        aria-label="Direct textarea"
      />
    );

    const textarea = screen.getByRole("textbox", { name: "Direct textarea" });
    fireEvent.focus(textarea);
    fireEvent.blur(textarea);

    expect(handleFocus).toHaveBeenCalledTimes(1);
    expect(handleBlur).toHaveBeenCalledTimes(1);
    expect(textarea.closest('[data-part="root"]')).toHaveAttribute(
      "data-resize",
      "none"
    );
    expect(textarea).not.toHaveAttribute("style");
  });

  it("does not project the DS size enum onto intrinsic Group children", () => {
    const { container } = render(
      <InputGroup size="xl">
        <button type="button" data-testid="native-action">Native action</button>
        <React.Fragment>
          <span data-testid="fragment-child">Fragment child</span>
        </React.Fragment>
        <InputAddon>USD</InputAddon>
      </InputGroup>
    );

    expect(screen.getByTestId("native-action")).not.toHaveAttribute("size");
    expect(screen.getByTestId("fragment-child")).not.toHaveAttribute("size");
    expect(container.querySelector(".rottay-input-addon")).toHaveAttribute("data-size", "xl");
  });

  it("stamps textarea loading, resize and progressive count states without overlays", () => {
    const { rerender, container } = render(
      <InputTextArea
        value="123456789"
        maxLength={10}
        showCount
        loading
        resize="both"
        aria-label="Audited notes"
      />
    );

    const control = screen.getByRole("textbox", { name: "Audited notes" });
    expect(control).toHaveAttribute("aria-busy", "true");
    expect(control.closest('[data-part="root"]')).toHaveAttribute("data-resize", "both");
    expect(screen.getByText("9/10")).toHaveAttribute("data-count-state", "warning");
    expect(container.querySelector('[data-part="loading-indicator"]')).toBeInTheDocument();

    rerender(
      <InputTextArea value="1234567890" maxLength={10} showCount aria-label="Audited notes" />
    );
    expect(screen.getByText("10/10")).toHaveAttribute("data-count-state", "limit");
  });
});

describe("Input CSS-first skin (WO-ARC-07)", () => {
  it("modern: the plain and addon-wrapped branches stamp the identical shell contract", () => {
    const { container: plainContainer } = render(
      <ModernInput variant="filled" size="lg" aria-label="Plain" />
    );
    const plainShell = screen.getByRole("textbox", { name: "Plain" });
    expect(plainShell.tagName).toBe("INPUT");
    expect(plainShell.className).toContain("rottay-input");
    expect(plainShell.className).toContain("rottay-input--modern");
    expect(plainShell).toHaveAttribute("data-part", "root");
    expect(plainShell).toHaveAttribute("data-variant", "filled");
    expect(plainShell).toHaveAttribute("data-size", "lg");

    const { container: wrappedContainer } = render(
      <ModernInput
        variant="filled"
        size="lg"
        prefix={<span>@</span>}
        aria-label="Wrapped"
      />
    );
    // Interactive suffix buttons cannot be descendants of a label. The shell
    // is therefore a neutral div while the actual input remains labelable.
    const wrappedShell = wrappedContainer.querySelector(
      '.rottay-input[data-part="root"]'
    ) as HTMLDivElement;
    expect(wrappedShell).not.toBeNull();
    expect(wrappedShell.tagName).toBe("DIV");
    expect(wrappedShell.className).toContain("rottay-input");
    expect(wrappedShell.className).toContain("rottay-input--modern");
    expect(wrappedShell).toHaveAttribute("data-part", "root");
    expect(wrappedShell).toHaveAttribute("data-variant", "filled");
    expect(wrappedShell).toHaveAttribute("data-size", "lg");

    // The actual control has a stable public anatomy part but never the
    // paint-triggering root class, so the skin cannot double-paint it.
    const innerInput = screen.getByRole("textbox", { name: "Wrapped" });
    expect(innerInput.className).toBe("rottay-input__control");
    expect(innerInput).toHaveAttribute("data-part", "control");

    plainContainer.remove();
    wrappedContainer.remove();
  });

  it("modern: hover and focus toggle data-state on the shell, and blur clears it", () => {
    render(<ModernInput aria-label="Stateful" />);
    const shell = screen.getByRole("textbox", { name: "Stateful" });

    expect(shell).not.toHaveAttribute("data-state");

    fireEvent.pointerEnter(shell);
    expect(shell.getAttribute("data-state")).toContain("hovered");

    fireEvent.focus(shell);
    expect(shell.getAttribute("data-state")).toContain("focused");

    fireEvent.blur(shell);
    fireEvent.pointerLeave(shell);
    expect(shell).not.toHaveAttribute("data-state");
  });

  it("modern: a disabled input reports no hover or focus state", () => {
    render(<ModernInput disabled aria-label="Disabled stateful" />);
    const shell = screen.getByRole("textbox", { name: "Disabled stateful" });

    fireEvent.pointerEnter(shell);
    fireEvent.focus(shell);
    // `disabled` is itself one of the serialized `data-state` flags
    // (`behavior/anatomy.ts`'s STATE_FLAG_ORDER), so the attribute is
    // present -- what must be absent is `hovered`/`focused` within it.
    expect(shell.getAttribute("data-state")).toBe("disabled");
    expect(shell).toHaveAttribute("data-disabled", "true");
  });

  it("modern: error/warning/success stamp the DOM contract the skin (and any consumer) reads", () => {
    const { rerender } = render(
      <ModernInput status="error" aria-label="Status" />
    );
    expect(screen.getByRole("textbox", { name: "Status" })).toHaveAttribute(
      "data-invalid",
      "true"
    );

    rerender(<ModernInput status="warning" aria-label="Status" />);
    expect(screen.getByRole("textbox", { name: "Status" })).toHaveAttribute(
      "data-warning",
      "true"
    );
    expect(screen.getByRole("textbox", { name: "Status" })).not.toHaveAttribute(
      "data-invalid"
    );

    rerender(<ModernInput status="success" aria-label="Status" />);
    expect(screen.getByRole("textbox", { name: "Status" })).toHaveAttribute(
      "data-success",
      "true"
    );

    // `error` (the boolean prop) outranks `status`, matching the component's
    // own `hasError = error || status === 'error'` precedence.
    rerender(<ModernInput error status="warning" aria-label="Status" />);
    expect(screen.getByRole("textbox", { name: "Status" })).toHaveAttribute(
      "data-invalid",
      "true"
    );
    expect(screen.getByRole("textbox", { name: "Status" })).not.toHaveAttribute(
      "data-warning"
    );
  });

  it("modern skin: focus and semantic rings use valid public box-shadow channels", () => {
    // The skin paints from a stylesheet this runtime never loads. What is
    // assertable here is the CONTRACT the sheet answers to (established in
    // the component tests above) and the sheet's own content, the way
    // Card.real-engines.test.tsx reads `skin/card.css` directly. The pixels
    // themselves are measured against a real cascade by
    // `packages/showroom/e2e/visual/states.spec.ts`.
    const skin = readFileSync(
      join(
        __dirname,
        "../../../../../foundation/tokens/css/runtime/engines/modern/skin/input.css"
      ),
      "utf-8"
    );

    // No rule may substitute a box-shadow token into the outline shorthand
    // (the invalid declaration P-54 found) -- that string must not appear.
    expect(skin).not.toContain("solid var(--ds-input-shadow-focus");

    expect(skin).toContain("box-shadow: var(--ds-input-shadow-focus");
    expect(skin).toContain("box-shadow: var(--ds-input-error-shadow-focus");
    expect(skin).toContain("box-shadow: var(--ds-input-warning-shadow-focus");
    expect(skin).toContain("box-shadow: var(--ds-input-success-shadow-focus");
    expect(skin).toContain("@media (prefers-reduced-motion: reduce)");
    expect(skin).toContain("@media (forced-colors: active)");
  });

  it("modern: stamps filled/readOnly/loading anatomy and wires inline errors to the control", () => {
    const { container } = render(
      <I18nProvider locale="en" fallbackLocale="en">
        <ModernInput
          defaultValue="Ada"
          readOnly
          loading
          error
          errorMessage="Review this value"
          aria-label="Audited field"
        />
      </I18nProvider>
    );

    const control = screen.getByRole("textbox", { name: "Audited field" });
    const shell = container.querySelector('.rottay-input[data-part="root"]');
    const alert = screen.getByRole("alert");

    expect(shell).toHaveAttribute("data-filled", "true");
    expect(shell).toHaveAttribute("data-readonly", "true");
    expect(shell).toHaveAttribute("data-loading", "true");
    expect(control).toHaveAttribute("aria-busy", "true");
    expect(control.getAttribute("aria-describedby")).toContain(alert.id);
    expect(
      container.querySelector('[data-part="loading-indicator"]')
    ).toBeInTheDocument();
  });

  it("modern: responsive geometry lands on the painted shell in both structural branches", () => {
    const { container } = render(
      <ModernInput
        size={{ base: "sm", lg: "xl" }}
        prefix={<span aria-hidden="true">@</span>}
        aria-label="Responsive field"
      />
    );

    const shell = container.querySelector('.rottay-input[data-part="root"]');
    const generatedCss = container.querySelector("style")?.textContent ?? "";

    expect(shell).toHaveAttribute("data-size-responsive", "true");
    expect(shell).toHaveAttribute("data-responsive-id");
    expect(generatedCss).toContain(
      "padding-inline: var(--ds-input-sm-padding-x);"
    );
    expect(generatedCss).toContain(
      "--ds-input-responsive-radius: var(--ds-input-xl-radius"
    );
    expect(generatedCss).not.toContain("border-radius:");
    expect(generatedCss).toContain(
      "--ds-input-responsive-gap: var(--ds-input-xl-gap"
    );
  });

  it.each([
    ["es", "Mostrar contraseña", "Ocultar contraseña"],
    ["ar", "إظهار كلمة المرور", "إخفاء كلمة المرور"],
  ] as const)(
    "password action consumes the %s catalog without changing anatomy",
    async (locale, show, hide) => {
      render(
        <I18nProvider locale={locale} fallbackLocale="en">
          <div dir={locale === "ar" ? "rtl" : "ltr"}>
            <InputPassword
              engine="modern"
              defaultValue="secret"
              aria-label="Password"
            />
          </div>
        </I18nProvider>
      );

      const toggle = await screen.findByRole("button", { name: show });
      expect(toggle).toHaveAttribute("data-part", "visibility-toggle");
      fireEvent.click(toggle);
      expect(await screen.findByRole("button", { name: hide })).toHaveAttribute(
        "aria-pressed",
        "true"
      );
    }
  );

  it.each([
    ["en", "Clear", "Search"],
    ["es", "Limpiar", "Buscar"],
    ["ar", "مسح", "بحث"],
  ] as const)(
    "clear and search actions consume the %s catalog with stable anatomy",
    async (locale, clearLabel, searchLabel) => {
      const { container } = render(
        <I18nProvider locale={locale} fallbackLocale="en">
          <div dir={locale === "ar" ? "rtl" : "ltr"}>
            <ModernInput defaultValue="query" clearable aria-label="Clearable" />
            <InputSearch engine="modern" defaultValue="query" aria-label="Searchable" />
          </div>
        </I18nProvider>
      );

      expect(await screen.findByRole("button", { name: clearLabel })).toHaveAttribute("data-part", "clear-button");
      expect(await screen.findByRole("button", { name: searchLabel })).toHaveAttribute("data-part", "search-button");
      expect(container.querySelector('[dir="rtl"] [data-part="search-button"]')).toBe(
        locale === "ar" ? screen.getByRole("button", { name: searchLabel }) : null
      );
    }
  );

  it("keeps standalone action labels usable before an I18nProvider mounts", async () => {
    render(
      <div>
        <ModernInput defaultValue="query" clearable aria-label="Standalone clear" />
        <InputPassword engine="modern" defaultValue="secret" aria-label="Standalone password" />
        <InputSearch engine="modern" defaultValue="query" aria-label="Standalone search" />
      </div>
    );

    expect(screen.getByRole("button", { name: "Clear" })).toBeInTheDocument();
    expect(await screen.findByRole("button", { name: "Show password" })).toBeInTheDocument();
    expect(await screen.findByRole("button", { name: "Search" })).toBeInTheDocument();
  });

  it("the Input skin consumes visibly divergent values from both real brands", () => {
    const bithire = compileBrandTheme({
      brandTheme: bithireBrandTheme,
    }).cssVariables;
    const management = compileBrandTheme({
      brandTheme: themanagementmiamiBrandTheme,
    }).cssVariables;
    const skin = readFileSync(
      join(
        __dirname,
        "../../../../../foundation/tokens/css/runtime/engines/modern/skin/input.css"
      ),
      "utf-8"
    );

    const compoundSkin = readFileSync(
      join(
        __dirname,
        "../../../../../foundation/tokens/css/presentation/components/skin/input-compounds.css"
      ),
      "utf-8"
    );
    const formFieldSkin = readFileSync(
      join(
        __dirname,
        "../../../../../foundation/tokens/css/runtime/engines/modern/skin/form-field.css"
      ),
      "utf-8"
    );

    for (const [channel, consumer] of [
      ["--ds-input-bg", skin],
      ["--ds-input-color", skin],
      ["--ds-input-border-focus", skin],
      ["--ds-radius-input", skin],
      ["--ds-input-shadow-focus", skin],
      ["--ds-input-selection-bg", skin],
      ["--ds-input-filled-border", skin],
      ["--ds-input-action-focus-ring", skin],
      ["--ds-input-count-color-warning", skin],
      ["--ds-input-md-padding-y", compoundSkin],
      ["--ds-textarea-radius", compoundSkin],
      ["--ds-input-group-gap-separated", compoundSkin],
      ["--ds-form-field-gap", formFieldSkin],
    ] as const) {
      expect(bithire[channel], channel).toBeDefined();
      expect(management[channel], channel).toBeDefined();
      expect(bithire[channel], channel).not.toBe(management[channel]);
      expect(consumer).toContain(`var(${channel}`);
    }
  });

  it("rustic: the shell is always the wrapping <div>, in both branches", () => {
    const { container: plainContainer } = render(
      <RusticInput aria-label="Plain rustic" />
    );
    const plainShell = plainContainer.querySelector(
      ".rottay-input--rustic"
    ) as HTMLDivElement;
    expect(plainShell).not.toBeNull();
    expect(plainShell.tagName).toBe("DIV");
    expect(plainShell).toHaveAttribute("data-part", "root");

    const { container: wrappedContainer } = render(
      <RusticInput prefix={<span>@</span>} aria-label="Wrapped rustic" />
    );
    const wrappedShell = wrappedContainer.querySelector(
      ".rottay-input--rustic"
    ) as HTMLDivElement;
    expect(wrappedShell).not.toBeNull();
    expect(wrappedShell.tagName).toBe("DIV");
    expect(wrappedShell).toHaveAttribute("data-part", "root");

    plainContainer.remove();
    wrappedContainer.remove();
  });

  it("rustic: focus/error/warning/success/disabled state classes survive for the skin-pack contract", () => {
    const { container, rerender } = render(
      <RusticInput status="error" aria-label="Rustic status" />
    );
    let shell = container.querySelector(
      ".rottay-input--rustic"
    ) as HTMLDivElement;
    expect(shell.className).toContain("rottay-input--error");
    expect(shell).toHaveAttribute("data-invalid", "true");

    rerender(<RusticInput status="warning" aria-label="Rustic status" />);
    shell = container.querySelector(".rottay-input--rustic") as HTMLDivElement;
    expect(shell.className).toContain("rottay-input--warning");

    rerender(<RusticInput status="success" aria-label="Rustic status" />);
    shell = container.querySelector(".rottay-input--rustic") as HTMLDivElement;
    expect(shell.className).toContain("rottay-input--success");

    rerender(<RusticInput disabled aria-label="Rustic status" />);
    shell = container.querySelector(".rottay-input--rustic") as HTMLDivElement;
    expect(shell.className).toContain("rottay-input--disabled");

    rerender(<RusticInput aria-label="Rustic status" />);
    shell = container.querySelector(".rottay-input--rustic") as HTMLDivElement;
    fireEvent.focus(screen.getByRole("textbox", { name: "Rustic status" }));
    expect(shell.className).toContain("rottay-input--focused");
    expect(shell.getAttribute("data-state")).toContain("focused");
  });

  it("rustic skin: no rule keys on hover -- this engine has never repainted on it", () => {
    const skin = readFileSync(
      join(
        __dirname,
        "../../../../../foundation/tokens/css/runtime/engines/rustic/skin/input.css"
      ),
      "utf-8"
    );
    // Strip comments first: the header explains the absence in prose and
    // therefore mentions the literal selector string -- a real rule using it
    // would appear outside a `/* ... */` block.
    const rulesOnly = skin.replace(/\/\*[\s\S]*?\*\//g, "");
    expect(rulesOnly).not.toContain("[data-state~='hovered']");
  });
});

// ---------------------------------------------------------------------------
// K1-B01 / K1-B02: the modern Input shell-vs-control paint contract, resolved
// against the REAL stylesheet. jsdom never loads the skin, so these tests
// compute the cascade themselves -- real rendered DOM + real selector
// matching (`element.matches`) + specificity ordering -- and assert which
// declaration WINS each paint longhand, the way FieldsBatch.real-engines
// reads skins as source but one level closer to the browser's answer.
// ---------------------------------------------------------------------------

interface PaintSnapshot {
  borderWidth?: string;
  backgroundColor?: string;
  borderColor?: string;
  boxShadow?: string;
}

/** Strip comments and at-rule blocks, then return every `{selector, body}` rule. */
function parseSkinRules(css: string): Array<{ selector: string; body: string }> {
  const noComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const noAtRules = noComments.replace(/@[\w-]+[^{]*\{(?:[^{}]|\{[^}]*\})*\}/g, "");
  const rules: Array<{ selector: string; body: string }> = [];
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(noAtRules)) !== null) {
    rules.push({ selector: m[1].trim(), body: m[2].trim() });
  }
  return rules;
}

/** The (b, c) specificity columns of one comma-free selector. */
function specificityOf(selector: string): [number, number] {
  const classes = (selector.match(/\.[A-Za-z_-][\w-]*/g) || []).length;
  const attrs = (selector.match(/\[[^\]]*\]/g) || []).length;
  const pseudos = (selector.match(/(?<!:):[A-Za-z-]+/g) || []).length;
  const notArgs = (selector.match(/:not\(([^)]*)\)/g) || []).reduce(
    (n, frag) => n + specificityOf(frag.slice(5, -1))[0],
    0
  );
  const stripped = selector
    .replace(/:not\([^)]*\)/g, " ")
    .replace(/\.[A-Za-z_-][\w-]*/g, " ")
    .replace(/\[[^\]]*\]/g, " ")
    .replace(/::?[A-Za-z-]+/g, " ")
    .replace(/[>+~*]/g, " ");
  const elements = stripped
    .split(/\s+/)
    .filter((token) => /^[A-Za-z][\w-]*$/.test(token)).length;
  return [classes + attrs + pseudos + notArgs, elements];
}

/** Split a declaration value on top-level whitespace (var() commas stay whole). */
function splitTopLevel(value: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = "";
  for (const ch of value) {
    if (ch === "(") depth += 1;
    if (ch === ")") depth -= 1;
    if (/\s/.test(ch) && depth === 0) {
      if (current) parts.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  if (current) parts.push(current);
  return parts;
}

/** The declarations of one rule body, folded onto the paint longhands we track. */
function paintDeclarations(body: string): Array<{ prop: keyof PaintSnapshot; value: string }> {
  const out: Array<{ prop: keyof PaintSnapshot; value: string }> = [];
  for (const decl of body.split(";")) {
    const idx = decl.indexOf(":");
    if (idx < 0) continue;
    const prop = decl.slice(0, idx).trim().toLowerCase();
    const value = decl.slice(idx + 1).trim();
    if (prop === "border") {
      const parts = splitTopLevel(value);
      if (parts[0]) out.push({ prop: "borderWidth", value: parts[0] });
      if (parts.length >= 3) out.push({ prop: "borderColor", value: parts.slice(2).join(" ") });
    } else if (prop === "border-width") {
      out.push({ prop: "borderWidth", value });
    } else if (prop === "border-color") {
      out.push({ prop: "borderColor", value });
    } else if (prop === "background") {
      const parts = splitTopLevel(value);
      out.push({ prop: "backgroundColor", value: parts[parts.length - 1] ?? value });
    } else if (prop === "background-color") {
      out.push({ prop: "backgroundColor", value });
    } else if (prop === "box-shadow") {
      out.push({ prop: "boxShadow", value });
    }
  }
  return out;
}

/**
 * The paint longhands an element would compute from the skin: every matching
 * rule contributes its declarations at its best selector specificity; the
 * highest (b, c) wins, source order breaks ties.
 */
function computePaint(el: Element, rules: Array<{ selector: string; body: string }>): PaintSnapshot {
  const candidates: Array<{ spec: [number, number]; order: number; prop: keyof PaintSnapshot; value: string }> = [];
  rules.forEach((rule, order) => {
    let best: [number, number] | null = null;
    for (const part of rule.selector.split(",")) {
      let matches = false;
      try {
        matches = el.matches(part.trim());
      } catch {
        continue; // pseudos jsdom cannot evaluate (:-webkit-autofill, ::placeholder)
      }
      if (!matches) continue;
      const spec = specificityOf(part.trim());
      if (!best || spec[0] > best[0] || (spec[0] === best[0] && spec[1] > best[1])) best = spec;
    }
    if (!best) return;
    for (const decl of paintDeclarations(rule.body)) {
      candidates.push({ spec: best, order, prop: decl.prop, value: decl.value });
    }
  });
  const snapshot: PaintSnapshot = {};
  for (const prop of ["borderWidth", "backgroundColor", "borderColor", "boxShadow"] as const) {
    const sorted = candidates
      .map((candidate, index) => ({ ...candidate, index }))
      .filter((candidate) => candidate.prop === prop)
      .sort(
        (a, b) =>
          a.spec[0] - b.spec[0] || a.spec[1] - b.spec[1] || a.order - b.order || a.index - b.index
      );
    const winner = sorted[sorted.length - 1];
    if (winner) snapshot[prop] = winner.value;
  }
  return snapshot;
}

describe("Input modern skin -- shell/control paint contract (K1-B01, K1-B02)", () => {
  const skinCss = readFileSync(
    join(__dirname, "../../../../../foundation/tokens/css/runtime/engines/modern/skin/input.css"),
    "utf-8"
  );
  const compoundCss = readFileSync(
    join(__dirname, "../../../../../foundation/tokens/css/presentation/components/skin/input-compounds.css"),
    "utf-8"
  );
  const rules = parseSkinRules(skinCss);

  function paintOf(jsx: React.ReactElement, act?: (root: HTMLElement) => void): PaintSnapshot {
    const { unmount } = render(jsx);
    const root = screen.getByRole("textbox") as HTMLElement;
    act?.(root);
    const paint = computePaint(root, rules);
    unmount();
    return paint;
  }

  it("the standalone outline root keeps the variant's paint at rest (K1-B01)", () => {
    const paint = paintOf(<ModernInput variant="outline" aria-label="Rest audit" />);
    // Regression pin: this computed `0` / `transparent` when the control reset
    // selected the root node itself.
    expect(paint.borderWidth, "standalone outline root must not compute border-width: 0").toBeDefined();
    expect(paint.borderWidth!).not.toMatch(/^0(px)?$/);
    expect(paint.backgroundColor, "standalone outline root must not compute background: transparent").toBeDefined();
    expect(paint.backgroundColor!).not.toBe("transparent");
    // The paint owner is the skin's canonical channels -- nobody else.
    expect(paint.borderColor).toContain("var(--ds-input-border");
    expect(paint.backgroundColor).toContain("var(--ds-input-bg");
  });

  it("every variant of the standalone root keeps a painted border and surface at rest", () => {
    for (const [variant, borderChannel, bgChannel] of [
      ["outline", "--ds-input-border", "--ds-input-bg"],
      ["filled", "--ds-input-filled-border", "--ds-input-filled-bg"],
      ["flushed", "--ds-input-border", "--ds-input-bg"],
    ] as const) {
      const paint = paintOf(<ModernInput variant={variant} aria-label={`${variant} audit`} />);
      expect(paint.borderWidth, `${variant} border-width`).not.toMatch(/^0(px)?$/);
      expect(paint.borderColor, `${variant} border-color`).toContain(`var(${borderChannel}`);
      if (variant === "flushed") {
        expect(paint.backgroundColor).toBe("transparent"); // flushed's documented design
      } else {
        expect(paint.backgroundColor, `${variant} background`).toContain(`var(${bgChannel}`);
      }
    }
  });

  it("hover/focus/error/readonly/disabled repaint the standalone root through the channels", () => {
    const hovered = paintOf(<ModernInput aria-label="Hover audit" />, (root) => {
      fireEvent.pointerEnter(root);
    });
    expect(hovered.borderColor).toContain("var(--ds-input-border-hover");

    const focused = paintOf(<ModernInput aria-label="Focus audit" />, (root) => {
      fireEvent.focus(root);
    });
    expect(focused.borderColor).toContain("var(--ds-input-border-focus");
    expect(focused.boxShadow).toContain("var(--ds-input-shadow-focus");

    const invalid = paintOf(<ModernInput error aria-label="Error audit" />);
    expect(invalid.borderColor).toContain("var(--ds-input-error-border");

    const readonly = paintOf(<ModernInput readOnly aria-label="Readonly audit" />);
    expect(readonly.borderColor).toContain("var(--ds-input-readonly-border");
    expect(readonly.backgroundColor).toContain("var(--ds-input-readonly-bg");

    const disabled = paintOf(<ModernInput disabled aria-label="Disabled audit" />);
    expect(disabled.borderColor).toContain("var(--ds-input-border-disabled");
    expect(disabled.backgroundColor).toContain("var(--ds-input-bg-disabled");
  });

  it("guard: no paint-erasing rule can select the standalone root node (K1-B01)", () => {
    render(<ModernInput aria-label="Guard audit" />);
    const root = screen.getByRole("textbox", { name: "Guard audit" });
    const erasing = rules.filter(
      (rule) =>
        /background:\s*transparent/.test(rule.body) &&
        /(^|;)\s*border:\s*0\b/.test(rule.body) &&
        /box-shadow:\s*none/.test(rule.body)
    );
    // The guard is only meaningful while a chrome-free control reset exists.
    expect(erasing.length).toBeGreaterThan(0);
    for (const rule of erasing) {
      for (const part of rule.selector.split(",")) {
        expect(
          root.matches(part.trim()),
          `a paint-erasing rule must never match the root node: ${part.trim()}`
        ).toBe(false);
      }
    }
  });

  it("compound branch: the addon shell keeps paint and only the inner control is transparent", () => {
    const { unmount, container } = render(
      <ModernInput prefix={<span aria-hidden="true">@</span>} aria-label="Compound audit" />
    );
    const control = screen.getByRole("textbox", { name: "Compound audit" });
    const shell = control.closest(".rottay-input[data-part='root']") as HTMLElement;
    expect(shell.tagName).toBe("DIV");

    const shellRest = computePaint(shell, rules);
    expect(shellRest.borderWidth).toBeDefined();
    expect(shellRest.borderWidth!).not.toMatch(/^0(px)?$/);
    expect(shellRest.backgroundColor).toContain("var(--ds-input-bg");

    fireEvent.pointerEnter(shell);
    expect(computePaint(shell, rules).borderColor).toContain("var(--ds-input-border-hover");
    fireEvent.pointerLeave(shell);
    fireEvent.focus(control);
    const shellFocus = computePaint(shell, rules);
    expect(shellFocus.borderColor).toContain("var(--ds-input-border-focus");
    expect(shellFocus.boxShadow).toContain("var(--ds-input-shadow-focus");

    const controlPaint = computePaint(control, rules);
    expect(controlPaint.borderWidth).toBe("0");
    expect(controlPaint.backgroundColor).toBe("transparent");
    expect(container.querySelectorAll("input").length).toBe(1);
    unmount();
  });

  it("autofill paint still covers both structural branches", () => {
    expect(skinCss).toContain("> .rottay-input__control:-webkit-autofill");
    expect(skinCss).toContain(
      "input.rottay-input.rottay-input--modern[data-part='root']:-webkit-autofill"
    );
  });

  it("input-compounds: addon border color rides the doubled (0,4,0) anatomy booster (K1-B02)", () => {
    // Width/style stay on the base rule at (0,3,0) where nothing contests them.
    expect(compoundCss).toContain("border-width: var(--ds-input-border-width);");
    expect(compoundCss).toContain("border-style: var(--ds-input-border-style);");
    expect(compoundCss).not.toContain("var(--ds-input-border-width, 1px)");
    // The color doubles the anatomy anchor: 2 classes + 2 data-part attrs =
    // (0,4,0), clearing the tenant `html[data-tenant]:not([data-theme]):not(.light) *`
    // border floor at (0,3,1) (P-48). No !important, no third paint owner.
    const boosterSelector =
      ".rottay-input-addon.ds-input-addon[data-part='root'][data-part='root']";
    expect(specificityOf(boosterSelector)).toEqual([4, 0]);
    const booster = compoundCss.match(
      /\.rottay-input-addon\.ds-input-addon\[data-part='root'\]\[data-part='root'\]\s*\{([^}]*)\}/
    );
    expect(booster).not.toBeNull();
    expect(booster![1]).toContain("border-color: var(--ds-input-addon-border, var(--ds-input-border))");
    expect(booster![1]).not.toContain("!important");
  });
});
