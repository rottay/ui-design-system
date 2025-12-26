'use client';

import { forwardRef, useState } from 'react';
import type { InputPasswordProps } from '../../types';
import { BaseInput } from '../../base';
const EyeIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>);
const EyeOffIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="1" y1="1" x2="23" y2="23" /></svg>);
export const InputPassword = forwardRef<HTMLInputElement, InputPasswordProps>((props, ref) => { const { visibilityToggle = true, visibleIcon, hiddenIcon, ...inputProps } = props; const [visible, setVisible] = useState(false); const toggleButton = visibilityToggle ? <button type="button" onClick={() => setVisible(!visible)} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", display: "flex", color: "#bfbfbf" }} aria-label={visible ? "Hide" : "Show"} tabIndex={-1}>{visible ? (hiddenIcon || <EyeOffIcon />) : (visibleIcon || <EyeIcon />)}</button> : null; return <BaseInput {...inputProps} ref={ref} type={visible ? "text" : "password"} suffix={toggleButton} />; });
InputPassword.displayName = "Input.Password";
