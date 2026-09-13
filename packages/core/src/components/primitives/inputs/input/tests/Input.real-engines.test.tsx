import { readFileSync } from "node:fs";
import { join } from "node:path";

import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import ClassicInput from "../engines/classic";
import ModernInput from "../engines/modern";
import RusticInput from "../engines/rustic";
import { Input } from "..";
import { InputAddon } from "../compound/addon";
import { InputGroup } from "../compound/group";
import { InputPassword } from "../compound/password";
import { InputSearch } from "../compound/search";
import { InputTextArea } from "../compound/text-area";
import { renderWithEngine } from "@tests/support/engine";
import { I18nProvider } from "@/infrastructure/runtime/i18n";
import { lowerBrandThemeFixture } from "@tests/support/theme-lowering";
import { bithireBrandTheme } from "@/foundation/tokens/ts/presentation/brand-themes";
import { themanagementmiamiBrandTheme } from "@tests/fixtures/brand-themes/themanagementmiami";
import { responsiveChannelElement, responsiveCss } from "@tests/support/responsive";

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

    const addons = container.querySelectorAll(".ds-input-addon");
    const group = container.querySelector(".ds-input-group");
    expect(group).toHaveAttribute("data-compact", "true");
    expect(group).toHaveAttribute("data-size", "lg");
    expect((addons[0] as HTMLElement).style.borderTopRightRadius).toBe("");
    expect((addons[1] as HTMLElement).style.marginLeft).toBe("");

    rerender(
      <InputGroup compact={false} size="sm">
        <InputAddon position="before" variant="transparent">
          prefix
        </InputAddon>
        <InputAddon position="after">suffix</InputAddon>
      </InputGroup>
    );

    const nonCompactAddons = container.querySelectorAll(".ds-input-addon");
    expect(container.querySelector(".ds-input-group")).toHaveAttribute(
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
    expect(container.querySelector(".ds-input-addon")).toHaveAttribute("data-size", "xl");
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
    expect(plainShell.className).toContain("ds-input-shell");
    expect(plainShell.className).toContain("ds-input-shell--modern");
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
      '.ds-input-shell[data-part="root"]'
    ) as HTMLDivElement;
    expect(wrappedShell).not.toBeNull();
    expect(wrappedShell.tagName).toBe("DIV");
    expect(wrappedShell.className).toContain("ds-input-shell");
    expect(wrappedShell.className).toContain("ds-input-shell--modern");
    expect(wrappedShell).toHaveAttribute("data-part", "root");
    expect(wrappedShell).toHaveAttribute("data-variant", "filled");
    expect(wrappedShell).toHaveAttribute("data-size", "lg");

    // The actual control has a stable public anatomy part but never the
    // paint-triggering root class, so the skin cannot double-paint it.
    const innerInput = screen.getByRole("textbox", { name: "Wrapped" });
    expect(innerInput.className).toBe("ds-input-control");
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
    const shell = container.querySelector('.ds-input-shell[data-part="root"]');
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

    const shell = container.querySelector('.ds-input-shell[data-part="root"]');
    const generatedCss = responsiveCss(container);

    expect(shell).toHaveAttribute("data-size-responsive", "true");
    // The channels land on the SHELL, which is the node the skin paints.
    expect(shell).toBe(responsiveChannelElement(container));
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
        "../../../../../foundation/tokens/css/runtime/engines/rustic/skin/input/index.css"
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
