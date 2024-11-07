// Copied from https://github.com/rin-st/react-copy-to-clipboard-2

import { Children, KeyboardEvent, MouseEvent, ReactElement, cloneElement } from "react";
import copy from "copy-to-clipboard";

type CopyToClipboardProps = {
    text: string;
    children: ReactElement;
    onCopy?: (text: string, result: boolean) => void;
    options?: {
        debug?: boolean;
        message?: string;
        format?: string;
    };
};

export function CopyToClipboard({ text, children, onCopy, options }: CopyToClipboardProps) {
    const handleCopy = () => {
        const result = copy(text, options);
        if (onCopy) {
            onCopy(text, result);
        }
        return result;
    };

    const handleCopyClick = (event: MouseEvent<HTMLElement>) => {
        handleCopy();

        // Bypass onClick if it was present
        if (children.props && typeof children.props.onClick === "function") {
            children.props.onClick(event);
        }
    };

    const handleCopyKeyDown = (event: KeyboardEvent<HTMLElement>) => {
        if (event.key === "Enter") {
            handleCopy();
        }

        // Bypass onKeyDown if it was present
        if (children.props && typeof children.props.onKeyDown === "function") {
            children.props.onKeyDown(event);
        }
    };

    const onClick = (event: MouseEvent<HTMLElement>) => {
        handleCopyClick(event);
    };

    const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
        handleCopyKeyDown(event);
    };

    const elem = Children.only(children);

    return cloneElement(elem, {
        tabIndex: 0,
        ...(children.props || {}),
        onClick,
        onKeyDown,
    });
}
