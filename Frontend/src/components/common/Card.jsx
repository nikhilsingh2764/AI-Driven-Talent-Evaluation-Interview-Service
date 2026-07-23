function Card({
    title,
    subtitle,
    children,
    className = "",
}) {
    return (
        <div
            className={`
                w-full
                max-w-md
                rounded-2xl
                border
                border-gray-200
                bg-white
                p-8
                shadow-xl
                transition-all
                duration-300
                ${className}
            `}
        >
            {title && (
                <h1 className="mb-2 text-center text-3xl font-bold text-gray-900">
                    {title}
                </h1>
            )}

            {subtitle && (
                <p className="mb-8 text-center text-sm text-gray-500">
                    {subtitle}
                </p>
            )}

            {children}
        </div>
    );
}

export default Card;