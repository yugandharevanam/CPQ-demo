import React, { useState } from 'react';
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from '@/lib/utils';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt?: string;
    className?: string;
    fallbackClassName?: string;
    desc1FallbackClassName?: string;
    desc2FallbackClassName?: string;
    width?: string | number;
    height?: string | number;
}

const Image = React.forwardRef<HTMLImageElement, ImageProps>(({
    src,
    alt = "",
    className,
    fallbackClassName,
    desc1FallbackClassName,
    desc2FallbackClassName,
    width,
    height,
    ...props
}, ref) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    const handleLoad = () => {
        setIsLoading(false);
    };

    const handleError = () => {
        setIsLoading(false);
        setHasError(true);
    };

    return (
        <div
            className={cn(
                "relative overflow-hidden",
                className
            )}
            style={{
                width: width,
                height: height,
            }}
        >
            {(isLoading || hasError) && (
                <div className="flex flex-col space-y-3">
                    <Skeleton className={fallbackClassName} />
                    <div className="space-y-2">
                        <Skeleton className={`h-4 ${desc1FallbackClassName}`} />
                        <Skeleton className={`h-4 w-55 ${desc2FallbackClassName}`} />
                    </div>
                </div>
            )}

            {!hasError && (
                <img
                    ref={ref}
                    src={src}
                    alt={alt}
                    className={cn(
                        "object-cover duration-300 ease-in-out",
                        isLoading ? "scale-110 blur-sm opacity-0" : "scale-100 blur-0 opacity-100",
                    )}
                    onLoad={handleLoad}
                    onError={handleError}
                    style={{
                        width: width || '100%',
                        height: height || '100%',
                    }}
                    {...props}
                />
            )}
        </div>
    );
});

Image.displayName = "Image";

export { Image };