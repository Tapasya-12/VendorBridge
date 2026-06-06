import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";
import { ThemeProvider } from "@/components/theme-provider";
import NotFound from "@/pages/not-found";
import { setAuthTokenGetter } from "@workspace/api-client-react";

setAuthTokenGetter(() => localStorage.getItem("vb_token"));

import Login from "@/pages/login";
import Signup from "@/pages/signup";
import ForgotPassword from "@/pages/forgot-password";
import Dashboard from "@/pages/dashboard";

import Vendors from "@/pages/vendors";
import VendorsNew from "@/pages/vendors-new";
import VendorDetail from "@/pages/vendor-detail";

import Rfqs from "@/pages/rfqs";
import RfqsNew from "@/pages/rfqs-new";
import RfqDetail from "@/pages/rfq-detail";

import Quotations from "@/pages/quotations";
import QuotationsNew from "@/pages/quotations-new";
import QuotationDetail from "@/pages/quotation-detail";
import QuotationCompare from "@/pages/quotation-compare";

import Approvals from "@/pages/approvals";
import ApprovalDetail from "@/pages/approval-detail";

import PurchaseOrders from "@/pages/purchase-orders";
import PurchaseOrderNew from "@/pages/purchase-order-new";
import PurchaseOrderDetail from "@/pages/purchase-order-detail";

import Invoices from "@/pages/invoices";
import InvoiceNew from "@/pages/invoice-new";
import InvoiceDetail from "@/pages/invoice-detail";

import ActivityLogs from "@/pages/activity-logs";
import Analytics from "@/pages/analytics";
import Notifications from "@/pages/notifications";
import Settings from "@/pages/settings";
import ProfileSetup from "@/pages/profile-setup";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/profile-setup" component={ProfileSetup} />

      <Route path="/">
        <Layout><Dashboard /></Layout>
      </Route>
      <Route path="/dashboard">
        <Layout><Dashboard /></Layout>
      </Route>

      <Route path="/vendors/new">
        <Layout><VendorsNew /></Layout>
      </Route>
      <Route path="/vendors/:id">
        <Layout><VendorDetail /></Layout>
      </Route>
      <Route path="/vendors">
        <Layout><Vendors /></Layout>
      </Route>

      <Route path="/rfqs/new">
        <Layout><RfqsNew /></Layout>
      </Route>
      <Route path="/rfqs/:id">
        <Layout><RfqDetail /></Layout>
      </Route>
      <Route path="/rfqs">
        <Layout><Rfqs /></Layout>
      </Route>
      <Route path="/rfqs/:id/compare">
        <Layout><QuotationCompare /></Layout>
      </Route>

      <Route path="/quotations/new">
        <Layout><QuotationsNew /></Layout>
      </Route>
      <Route path="/quotations/:id">
        <Layout><QuotationDetail /></Layout>
      </Route>
      <Route path="/quotations">
        <Layout><Quotations /></Layout>
      </Route>

      <Route path="/approvals/:id">
        <Layout><ApprovalDetail /></Layout>
      </Route>
      <Route path="/approvals">
        <Layout><Approvals /></Layout>
      </Route>

      <Route path="/purchase-orders/new">
        <Layout><PurchaseOrderNew /></Layout>
      </Route>
      <Route path="/purchase-orders/:id">
        <Layout><PurchaseOrderDetail /></Layout>
      </Route>
      <Route path="/purchase-orders">
        <Layout><PurchaseOrders /></Layout>
      </Route>

      <Route path="/invoices/new">
        <Layout><InvoiceNew /></Layout>
      </Route>
      <Route path="/invoices/:id">
        <Layout><InvoiceDetail /></Layout>
      </Route>
      <Route path="/invoices">
        <Layout><Invoices /></Layout>
      </Route>

      <Route path="/activity-logs">
        <Layout><ActivityLogs /></Layout>
      </Route>
      <Route path="/analytics">
        <Layout><Analytics /></Layout>
      </Route>
      <Route path="/notifications">
        <Layout><Notifications /></Layout>
      </Route>
      <Route path="/settings">
        <Layout><Settings /></Layout>
      </Route>

      <Route>
        <Layout><NotFound /></Layout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="vendorbridge-theme">
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
