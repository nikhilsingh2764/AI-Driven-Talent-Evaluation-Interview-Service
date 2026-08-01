import clsx from "clsx";
import { LoaderCircle } from "lucide-react";

function Button({

    children,  // Represents everything written between <Button>...</Button>.

    type = "button",  //HTML button type. like button | submit | reset

    loading = false,  // Prevents multiple API requests by disabling the button.

    disabled = false, // Prevents user interaction with the button.

    className = "", //Allows additional Tailwind classes to be passed.

    ...props //Forwards any additional HTML button attributes (id, aria-label, autoFocus, onClick, form, etc.).
    

}) {

    return (

        <button

            {...props}

            disabled={loading || props.disabled}

            className={clsx(

                "flex w-full items-center justify-center gap-2",

                "rounded-lg",

                "bg-blue-600",

                "px-4 py-3",

                "font-medium",

                "text-white",

                "transition-colors",

                "hover:bg-blue-700",

                "disabled:cursor-not-allowed",

                "disabled:opacity-60",

                className

            )}

        >

            {loading && (

                <LoaderCircle

                    className="h-5 w-5 animate-spin"

                />

            )}

            {loading ? "Loading..." : children}

        </button>

    );

}

export default Button;