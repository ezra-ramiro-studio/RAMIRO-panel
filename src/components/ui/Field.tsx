"use client";

import {
  Children,
  isValidElement,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type InputHTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactElement,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { createPortal } from "react-dom";

const inputPaint =
  "bg-surface border border-border-2 rounded-[6px] outline-none focus:border-burgundy placeholder:text-muted transition-colors";

const SIZE = {
  md: "px-3 py-2 text-[13px]",
  sm: "px-3 py-1.5 text-[0.8rem]",
  xs: "px-2 py-1 mono text-[0.62rem] uppercase tracking-wider",
} as const;

type FieldSize = keyof typeof SIZE;

const inputBase = `w-full ${inputPaint} ${SIZE.md}`;

export function Label({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className="mono text-[10px] uppercase tracking-[0.16em] block mb-1.5 text-muted"
    >
      {children}
    </label>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputBase} ${props.className ?? ""}`} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputBase} min-h-[80px] ${props.className ?? ""}`} />;
}

/* -------------------------------------------------------------------------- */
/*                                   Select                                   */
/* -------------------------------------------------------------------------- */

interface SelectOption {
  value: string;
  label: ReactNode;
  disabled?: boolean;
}

function extractOptions(node: ReactNode): SelectOption[] {
  const out: SelectOption[] = [];
  const visit = (n: ReactNode) => {
    Children.forEach(n, (child) => {
      if (child == null || typeof child === "boolean") return;
      if (typeof child === "string" || typeof child === "number") return;
      if (!isValidElement(child)) return;
      const el = child as ReactElement<
        { value?: unknown; disabled?: boolean; children?: ReactNode }
      >;
      if (el.type === "option") {
        const raw = el.props.value;
        const value = raw === undefined ? "" : String(raw);
        out.push({
          value,
          label: el.props.children ?? value,
          disabled: !!el.props.disabled,
        });
      } else if (el.props?.children) {
        visit(el.props.children);
      }
    });
  };
  visit(node);
  return out;
}

type SelectChangeEvent = { target: { name?: string; value: string } };

type SelectProps = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "onChange" | "size"
> & {
  onChange?: (event: SelectChangeEvent) => void;
  size?: FieldSize;
  placeholder?: string;
  menuClassName?: string;
};

export function Select({
  id,
  name,
  required,
  disabled,
  value,
  defaultValue,
  onChange,
  className,
  children,
  size = "md",
  placeholder,
  menuClassName,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
}: SelectProps) {
  const options = useMemo(() => extractOptions(children), [children]);
  const isControlled = value !== undefined;

  const firstNonDisabled = options.find((o) => !o.disabled)?.value ?? "";
  const initial = String(
    defaultValue ?? (isControlled ? (value as string | number) : firstNonDisabled),
  );
  const [internal, setInternal] = useState<string>(initial);
  const selected = String(isControlled ? (value as string | number) : internal);
  const current = options.find((o) => o.value === selected);

  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [mounted, setMounted] = useState(false);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const update = () => {
      if (triggerRef.current) setRect(triggerRef.current.getBoundingClientRect());
    };
    update();
    const onScroll = () => update();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t)) return;
      if (listRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const idx = options.findIndex((o) => o.value === selected);
    setHighlight(idx >= 0 ? idx : options.findIndex((o) => !o.disabled));
  }, [open, options, selected]);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector<HTMLElement>(
      `[data-idx="${highlight}"]`,
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [open, highlight]);

  const commit = (val: string) => {
    if (!isControlled) setInternal(val);
    onChange?.({ target: { name, value: val } });
    setOpen(false);
    triggerRef.current?.focus();
  };

  const moveHighlight = (dir: 1 | -1) => {
    if (options.length === 0) return;
    setHighlight((h) => {
      for (let i = 1; i <= options.length; i++) {
        const n = (h + dir * i + options.length) % options.length;
        if (!options[n]?.disabled) return n;
      }
      return h;
    });
  };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (!open) {
      if (
        e.key === "Enter" ||
        e.key === " " ||
        e.key === "ArrowDown" ||
        e.key === "ArrowUp"
      ) {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    switch (e.key) {
      case "Escape":
        e.preventDefault();
        setOpen(false);
        break;
      case "ArrowDown":
        e.preventDefault();
        moveHighlight(1);
        break;
      case "ArrowUp":
        e.preventDefault();
        moveHighlight(-1);
        break;
      case "Home":
        e.preventDefault();
        setHighlight(options.findIndex((o) => !o.disabled));
        break;
      case "End":
        e.preventDefault();
        for (let i = options.length - 1; i >= 0; i--) {
          if (!options[i].disabled) {
            setHighlight(i);
            break;
          }
        }
        break;
      case "Enter":
      case " ": {
        e.preventDefault();
        const opt = options[highlight];
        if (opt && !opt.disabled) commit(opt.value);
        break;
      }
      case "Tab":
        setOpen(false);
        break;
    }
  };

  const sizeCls = SIZE[size];
  const triggerCls = [
    "w-full flex items-center justify-between gap-2 text-left cursor-pointer",
    inputPaint,
    sizeCls,
    open ? "border-burgundy" : "",
    disabled ? "opacity-60 cursor-not-allowed" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  const showPlaceholder = !current && !!placeholder;
  const labelNode = showPlaceholder ? (
    <span className="text-muted">{placeholder}</span>
  ) : (
    current?.label ?? <span className="text-muted">—</span>
  );

  const activeDescendant = open ? `${listId}-opt-${highlight}` : undefined;

  const menuStyle: CSSProperties = rect
    ? {
        position: "fixed",
        left: rect.left,
        top: rect.bottom + 4,
        width: rect.width,
        zIndex: 100,
      }
    : { display: "none" };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        id={id}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={activeDescendant}
        aria-disabled={disabled}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        onKeyDown={onKeyDown}
        className={triggerCls}
      >
        <span className="truncate flex-1">{labelNode}</span>
        <svg
          width="10"
          height="6"
          viewBox="0 0 10 6"
          fill="none"
          aria-hidden
          className={`shrink-0 text-muted transition-transform ${
            open ? "rotate-180" : ""
          }`}
        >
          <path
            d="M1 1l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <input
        type="hidden"
        name={name}
        value={selected}
        {...(required ? { required: true } : {})}
      />
      {mounted && open
        ? createPortal(
            <ul
              ref={listRef}
              id={listId}
              role="listbox"
              style={menuStyle}
              className={`max-h-[260px] overflow-y-auto rounded-[8px] border border-border-2 bg-surface-2 py-1 shadow-[0_20px_48px_rgba(33,25,20,0.22)] ${
                menuClassName ?? ""
              }`}
            >
              {options.length === 0 ? (
                <li className="px-3 py-2 text-[13px] text-muted serif italic">
                  Sin opciones
                </li>
              ) : (
                options.map((o, i) => {
                  const isSel = o.value === selected;
                  const isHi = i === highlight && !o.disabled;
                  return (
                    <li
                      key={`${o.value}-${i}`}
                      id={`${listId}-opt-${i}`}
                      data-idx={i}
                      role="option"
                      aria-selected={isSel}
                      aria-disabled={o.disabled || undefined}
                      onMouseEnter={() => !o.disabled && setHighlight(i)}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        if (!o.disabled) commit(o.value);
                      }}
                      className={[
                        "relative flex items-center gap-2 px-3 py-1.5 text-[13px] cursor-pointer select-none",
                        o.disabled ? "opacity-40 cursor-not-allowed" : "",
                        isHi ? "bg-surface" : "",
                        isSel ? "text-burgundy" : "text-[color:var(--color-text)]",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      <span
                        aria-hidden
                        className={`w-[3px] h-4 rounded-full ${
                          isSel ? "bg-burgundy" : "bg-transparent"
                        }`}
                      />
                      <span className="truncate flex-1">{o.label}</span>
                      {isSel ? (
                        <svg
                          width="10"
                          height="8"
                          viewBox="0 0 10 8"
                          fill="none"
                          aria-hidden
                          className="shrink-0 text-burgundy"
                        >
                          <path
                            d="M1 4.2L3.8 7 9 1.3"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : null}
                    </li>
                  );
                })
              )}
            </ul>,
            document.body,
          )
        : null}
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 Form layout                                */
/* -------------------------------------------------------------------------- */

export function FormRow({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-1.5 mb-4">{children}</div>;
}

export function FormGrid({ children, cols = 2 }: { children: ReactNode; cols?: 1 | 2 | 3 }) {
  const g = cols === 1 ? "grid-cols-1" : cols === 3 ? "grid-cols-3" : "grid-cols-2";
  return <div className={`grid gap-3 ${g} mb-4`}>{children}</div>;
}

export function FormActions({ children }: { children: ReactNode }) {
  return <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-border-1">{children}</div>;
}

export function ErrorText({ children }: { children: ReactNode }) {
  if (!children) return null;
  return (
    <div
      className="text-[12px] px-3 py-2 rounded-[6px] mt-3 bg-[rgba(166,53,44,0.08)] text-[#A6352C] border border-[rgba(166,53,44,0.25)]"
    >
      {children}
    </div>
  );
}
