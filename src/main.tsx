import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./style.css";
import App from "./App";
import Home from "./pages/Home";
import MovieDetail from "./pages/MovieDetail";
import MoviePlayer from "./pages/MoviePlayer";
import Development from "./pages/Development";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: "movie/:id", element: <MovieDetail /> },
      { path: "movie/:id/watch", element: <MoviePlayer /> },
      { path: "development", element: <Development /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
