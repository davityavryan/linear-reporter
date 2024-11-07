import React, { useCallback, useEffect, useState } from "react";

import { subMonths, startOfMonth, format } from "date-fns";
import { LinearClient, IssueConnection } from "@linear/sdk";

import "../globals.css";

import { Spinner } from "../components/Spinner";
import { CopyToClipboard } from "../components/CopyToClipboard";
import { CopyIcon } from "../icons/Copy";

export default function Page() {
    const [apiKey, setApiKey] = useState<string>(global?.localStorage?.getItem("apiKey") ?? "");
    const [tickets, setTickets] = useState<Record<string, IssueConnection["nodes"]>>({});
    const [isLoading, setIsLoading] = useState(false);

    const getApiKey = useCallback(() => {
        const promptValue = prompt("Please provide your Linear API key");

        if (promptValue) {
            setApiKey(promptValue);
            setIsLoading(true);
            localStorage.setItem("apiKey", promptValue);
        }
    }, []);

    useEffect(() => {
        if (apiKey) {
            setIsLoading(true);

            const linearClient = new LinearClient({ apiKey });

            void (async () => {
                const me = await linearClient.viewer;
                const myIssues = await me.assignedIssues({
                    filter: {
                        completedAt: {
                            gte: startOfMonth(subMonths(new Date(), 2)),
                        },
                    },
                });

                setTickets(
                    myIssues.nodes
                        .filter(({ completedAt }) => !!completedAt)
                        .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime())
                        .reduce((accumulator, node) => {
                            const month = node.completedAt.toLocaleString("default", { month: "long" });

                            return {
                                ...accumulator,
                                [month]: [...(accumulator[month] ?? []), node],
                            };
                        }, {}),
                );
                setIsLoading(false);
            })();
        }
    }, [apiKey]);

    return (
        <div className="font-mono bg-stone-800 text-white p-4 pt-0 min-h-screen min-w-screen">
            {!isLoading && (
                <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center p-3 z-0 select-none">
                    <div className="mb-3">No API key provided </div>

                    <button className="text-blue-600 border border-blue-600 p-2 rounded inline-flex items-center" onClick={getApiKey}>
                        Ok, fine, I will provide it...
                    </button>
                </div>
            )}

            {isLoading && <Spinner className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}

            {Object.entries(tickets).map(([month, nodes]) => (
                <div key={month} className="relative z-10 bg-stone-800">
                    <div className="sticky top-0 bg-stone-800 select-none text-center font-bold py-3 flex justify-center">
                        <div className="flex items-center gap-3">
                            {month}
                            <CopyToClipboard text={nodes.map(({ title }) => `- ${title}`).join("\n")}>
                                <button>
                                    <CopyIcon />
                                </button>
                            </CopyToClipboard>
                        </div>
                    </div>

                    {nodes.map(({ completedAt, identifier, title }) => (
                        <div key={`${completedAt.toString()}-identifier`} className="md:flex gap-5 md:gap-3">
                            <div className="select-none">{identifier}</div>
                            <div className="flex-1 min-w-0 py-1 md:py-0 -indent-5 ml-5">- {title}</div>
                            <div className="select-none text-right">{format(completedAt, "dd MMM yyyy")}</div>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}
