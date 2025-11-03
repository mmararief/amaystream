import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./style.css";
import App from "./App";
import Home from "./pages/Home";
import Search from "./pages/Search";
import MovieDetail from "./pages/MovieDetail";
import MoviePlayer from "./pages/MoviePlayer";
import TVDetail from "./pages/TVDetail";
import TVPlayer from "./pages/TVPlayer";
import Development from "./pages/Development";
import SportsLive from "./pages/SportsLive";
import SportsPlayer from "./pages/SportsPlayer";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: "search", element: <Search /> },
      { path: "movie/:id", element: <MovieDetail /> },
      { path: "movie/:id/watch", element: <MoviePlayer /> },
      { path: "tv/:id", element: <TVDetail /> },
      { path: "tv/:id/watch", element: <TVPlayer /> },
      { path: "development", element: <Development /> },
      { path: "sports", element: <SportsLive /> },
      { path: "sports/:source/:id/watch", element: <SportsPlayer /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
