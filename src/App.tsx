import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import CreateTrip from "./pages/CreateTrip";
import TripLayout from "./pages/TripLayout";
import TripItinerary from "./pages/TripItinerary";
import TripBudget from "./pages/TripBudget";
import TripNotes from "./pages/TripNotes";
import TripPacking from "./pages/TripPacking";
import TripsList from "./pages/TripsList";
import Settings from "./pages/Settings";
import AdminDashboard from "./pages/Admin";
import SharedTrip from "./pages/SharedTrip";

const router = createBrowserRouter([
  {
    path: "/auth",
    element: <Auth />
  },
  {
    path: "/shared/:id",
    element: <SharedTrip />
  },
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Dashboard />
      },
      {
         path: "trips",
         element: <TripsList />
      },
      {
        path: "trips/new",
        element: <CreateTrip />
      },
      {
        path: "settings",
        element: <Settings />
      },
      {
        path: "admin",
        element: <AdminDashboard />
      },
      {
        path: "trips/:id",
        element: <TripLayout />,
        children: [
           { index: true, element: <Navigate to="itinerary" replace /> },
           { path: "itinerary", element: <TripItinerary /> },
           { path: "budget", element: <TripBudget /> },
           { path: "packing", element: <TripPacking /> },
           { path: "notes", element: <TripNotes /> }
        ]
      }
    ]
  }
]);

export default function App() {
  return <RouterProvider router={router} />;
}
