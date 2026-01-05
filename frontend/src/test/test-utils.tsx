/* eslint-disable react-refresh/only-export-components */
import React from "react";
import { render, RenderOptions } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import { ThemeProvider } from "../context/ThemeContext";

interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  withRouter?: boolean;
  withAuth?: boolean;
  withTheme?: boolean;
}

function AllTheProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>{children}</AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

function customRender(
  ui: React.ReactElement,
  { withRouter = true, withAuth = true, withTheme = true, ...options }: CustomRenderOptions = {}
) {
  let wrapper = ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  );

  if (withAuth && withRouter && withTheme) {
    wrapper = AllTheProviders;
  } else if (withRouter && withAuth) {
    wrapper = ({ children }: { children: React.ReactNode }) => (
      <BrowserRouter>
        <AuthProvider>{children}</AuthProvider>
      </BrowserRouter>
    );
  } else if (withRouter && withTheme) {
    wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider>
        <BrowserRouter>{children}</BrowserRouter>
      </ThemeProvider>
    );
  } else if (withAuth && withTheme) {
    wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider>
        <AuthProvider>{children}</AuthProvider>
      </ThemeProvider>
    );
  } else if (withRouter) {
    wrapper = ({ children }: { children: React.ReactNode }) => (
      <BrowserRouter>{children}</BrowserRouter>
    );
  } else if (withAuth) {
    wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );
  } else if (withTheme) {
    wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    );
  }

  return render(ui, { wrapper, ...options });
}

export * from "@testing-library/react";
export { customRender as render };
