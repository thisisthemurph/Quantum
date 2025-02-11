import { useEffect } from "react";
import { useLocation } from "react-router";

const useRouteChange = (callback: () => void) => {
  const location = useLocation();

  useEffect(() => {
    callback();
  }, [location.pathname]); // Runs whenever the pathname changes
};

export default useRouteChange;
