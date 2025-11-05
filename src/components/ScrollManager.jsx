import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollManager() {
    const location = useLocation();

    // Disable browser auto-restoration so we control it.
    useEffect(() => {
        if ("scrollRestoration" in window.history) {
            window.history.scrollRestoration = "manual";
        }
    }, []);

    useEffect(() => {
        // Temporarily disable smooth behavior so the jump is instant
        const html = document.documentElement;
        const previous = html.style.scrollBehavior;
        html.style.scrollBehavior = "auto";

        if (location.hash) {
            // If there is a #hash, try to scroll to that element
            const id = decodeURIComponent(location.hash.slice(1));
            const el = document.getElementById(id);
            if (el) {
                el.scrollIntoView({ block: "start" });
            } else {
                window.scrollTo(0, 0);
            }
        } else {
            // No hash → go to top
            window.scrollTo(0, 0);
        }

        // Restore whatever you had (allows smooth scrolling elsewhere)
        html.style.scrollBehavior = previous;
    }, [location.pathname, location.search, location.hash]);

    return null;
}
