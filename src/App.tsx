import { Switch, Route, Router, Redirect } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import Home from "@/pages/Home";
import Gifts from "@/pages/Gifts";
import RSVP from "@/pages/RSVP";
import OnlineOznam from "@/pages/OnlineOznam";
import NotFound from "@/pages/not-found";
// Import nové svatební fotogalerie
import { WeddingGallery } from "@/components/WeddingGallery";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* useHashLocation zajistí, že URL bude vypadat jako /#/rsvp. 
          To GitHub Pages milují, protože se nikdy neptají serveru na novou cestu. */}
      <Router hook={useHashLocation}>
        <TooltipProvider>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/gifts-reservation" component={Gifts} />
            <Route path="/rsvp" component={RSVP} />
            <Route path="/online-oznam" component={OnlineOznam} />
            {/* Nová routa pro přístup do fotogalerie přes /#/galerie */}
            <Route path="/galerie" component={WeddingGallery} />
            <Route>
              <Redirect to="/" />
            </Route>
          </Switch>
          <Toaster />
        </TooltipProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
