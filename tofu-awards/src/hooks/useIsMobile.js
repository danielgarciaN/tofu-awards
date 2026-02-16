import { useEffect, useState } from "react";

const MOBILE_QUERY = "(max-width: 768px)";

const useIsMobile = () => {
  const getIsMobile = () =>
    typeof window !== "undefined" && window.matchMedia(MOBILE_QUERY).matches;

  const [isMobile, setIsMobile] = useState(getIsMobile);

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_QUERY);

    const handleChange = (event) => {
      setIsMobile(event.matches);
    };

    setIsMobile(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return isMobile;
};

export default useIsMobile;
