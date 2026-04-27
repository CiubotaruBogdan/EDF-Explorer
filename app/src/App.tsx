import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Router as WouterRouter, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import ProjectsList from "./pages/ProjectsList";
import ProjectDetail from "./pages/ProjectDetail";
import CompaniesList from "./pages/CompaniesList";
import CompanyDetail from "./pages/CompanyDetail";
import Statistics from "./pages/Statistics";
import ChartBuilder from "./pages/ChartBuilder";
import About from "./pages/About";

// Wouter base: "" at root, "/edf-explorer" under a subfolder deploy.
const ROUTER_BASE = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/projects" component={ProjectsList} />
      <Route path="/projects/:key" component={ProjectDetail} />
      <Route path="/companies" component={CompaniesList} />
      <Route path="/companies/:id" component={CompanyDetail} />
      <Route path="/statistics" component={Statistics} />
      <Route path="/charts" component={ChartBuilder} />
      <Route path="/about" component={About} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <WouterRouter base={ROUTER_BASE}>
            <Router />
          </WouterRouter>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
