"use client";

import { Menu, Moon, Sun, X, type LucideIcon } from "lucide-react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";

const THEME_STORAGE_KEY = "kinova-theme";
const LIGHT_THEME = "cartas";
const DARK_THEME = "cartas-dark";

export type TemplateMenuOption = {
  icon: LucideIcon;
  onClick: () => void;
  title: string;
};

export type TemplateProps = {
  children: ReactNode;
  menuOptions: TemplateMenuOption[];
  pageTitle: string;
  projectIcon: LucideIcon;
  projectTitle: string;
};

export default function DashboardTemplate({
  children,
  menuOptions,
  pageTitle,
  projectIcon: ProjectIcon,
  projectTitle,
}: TemplateProps) {
  const drawerId = `template-drawer-${useId().replaceAll(":", "")}`;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const themeControllerRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    const isDarkTheme = savedTheme === DARK_THEME;

    if (themeControllerRef.current) {
      themeControllerRef.current.checked = isDarkTheme;
    }

    document.documentElement.dataset.theme = isDarkTheme
      ? DARK_THEME
      : LIGHT_THEME;
  }, []);

  function handleThemeChange(isDarkTheme: boolean) {
    const theme = isDarkTheme ? DARK_THEME : LIGHT_THEME;

    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }

  return (
    <div className="drawer min-h-screen bg-base-200 lg:drawer-open">
      <input
        checked={drawerOpen}
        className="drawer-toggle"
        id={drawerId}
        onChange={(event) => setDrawerOpen(event.target.checked)}
        type="checkbox"
      />

      <div className="drawer-content flex min-h-screen flex-col">
        <header className="navbar min-h-16 bg-base-200 px-4 lg:hidden">
          <div className="flex-none">
            <button
              aria-label="Abrir menu"
              className="btn btn-ghost btn-square"
              onClick={() => setDrawerOpen(true)}
              type="button"
            >
              <Menu aria-hidden="true" className="size-5" />
            </button>
          </div>
          <div className="flex flex-1 justify-end">
            <span className="font-semibold tracking-tight">{projectTitle}</span>
          </div>
        </header>

        <main className="flex min-h-0 flex-1 flex-col gap-4 p-4 md:p-8">
          <h1 className="text-3xl sm:text-4xl">
            {pageTitle}
          </h1>
          <section className="card md:p-8 flex-1 bg-base-100 shadow-lg">
            <div className="card-body min-h-0">{children}</div>
          </section>
        </main>
      </div>

      <div className="drawer-side z-30">
        <label
          aria-label="Cerrar menu"
          className="drawer-overlay"
          htmlFor={drawerId}
        />
        <aside className="flex min-h-full w-72 flex-col bg-base-200 p-4 md:p-8">
          <div className="flex items-center justify-between gap-3 px-2 mt-4">
            <div className="flex min-w-0 items-center gap-3">
              <ProjectIcon
                aria-hidden="true"
                className="size-5 shrink-0 text-primary"
              />
              <span className="truncate font-semibold tracking-tight">
                {projectTitle}
              </span>
            </div>
            <button
              aria-label="Cerrar menu"
              className="btn btn-ghost btn-square btn-sm lg:hidden"
              onClick={() => setDrawerOpen(false)}
              type="button"
            >
              <X aria-hidden="true" className="size-5" />
            </button>
          </div>

          <ul className="menu mt-6 w-full gap-1 p-0">
            {menuOptions.map(({ icon: Icon, onClick, title }) => (
              <li key={title}>
                <button
                  className="w-full justify-start gap-3 p-4 text-sm"
                  onClick={() => {
                    onClick();
                    setDrawerOpen(false);
                  }}
                  type="button"
                >
                  <Icon aria-hidden="true" className="size-4" />
                  {title}
                </button>
              </li>
            ))}
          </ul>

          <label className="mt-auto flex cursor-pointer gap-2 self-end">
            <Sun className="stroke-warning" />
            <input
              aria-label="Cambiar tema"
              className="toggle theme-controller"
              onChange={(event) => handleThemeChange(event.target.checked)}
              ref={themeControllerRef}
              type="checkbox"
            />
            <Moon className="stroke-info/50"  />
          </label>
        </aside>
      </div>
    </div>
  );
}
