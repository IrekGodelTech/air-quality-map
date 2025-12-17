import React from "react";
import { render, RenderOptions } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";

interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  withRouter?: boolean;
  withAuth?: boolean;
}

function AllTheProviders({ children }: { children: React.ReactNode }) {
  return (
    <BrowserRouter>
      <AuthProvider>{children}</AuthProvider>
    </BrowserRouter>
  );
}

function customRender(
  ui: React.ReactElement,
  { withRouter = true, withAuth = true, ...options }: CustomRenderOptions = {}
) {
  let wrapper = ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  );

  if (withAuth && withRouter) {
    wrapper = AllTheProviders;
  } else if (withRouter) {
    wrapper = ({ children }: { children: React.ReactNode }) => (
      <BrowserRouter>{children}</BrowserRouter>
    );
  } else if (withAuth) {
    wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );
  }

  return render(ui, { wrapper, ...options });
}

export * from "@testing-library/react";
export { customRender as render };
