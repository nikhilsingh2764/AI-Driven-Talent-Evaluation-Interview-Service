import clsx from "clsx";

function Input({

    label, // Displays the field name above the input.

    error,  //Displays validation errors from React Hook Form or Zod.

    className,

    ...props


}) {

    return (

        <div className="flex flex-col gap-2">

            {label && (

                <label
                    className="text-sm font-medium text-gray-700"
                >
                    {label}
                </label>

            )}

            <input

                className={clsx(

                    "w-full",

                    "rounded-lg",

                    "border",

                    "border-gray-300",

                    "bg-white",

                    "px-4",

                    "py-3",

                    "text-gray-900",

                    "outline-none",

                    "transition-colors",

                    "duration-200",

                    "placeholder:text-gray-400",

                    "focus:border-blue-500",

                    "focus:ring-2",

                    "focus:ring-blue-500/20",

                    error &&
                    "border-red-500 focus:border-red-500 focus:ring-red-500/20",

                    props.disabled &&
                    "cursor-not-allowed bg-gray-100",

                    className

                )}

                {...props}

            />

            {error && (

                <p className="text-sm text-red-500">

                    {error}

                </p>

            )}

        </div>

    );

}

export default Input;