"use client";

import { MemoryGraph } from "@supermemory/memory-graph";
import type { DocumentWithMemories } from "@supermemory/memory-graph";
import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Network } from "lucide-react";

export default function AdminMemory() {
  const [documents, setDocuments] = useState<DocumentWithMemories[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchDocuments = useCallback(
    async (pageNum: number, append = false) => {
      pageNum === 1 ? setIsLoading(true) : setIsLoadingMore(true);
      setError(null);

      try {
        const res = await fetch(`/api/memory/graph?page=${pageNum}&limit=100`);
        if (!res.ok) throw new Error("Failed to fetch memory data");

        const data = await res.json();
        const docs = data.documents || [];

        append
          ? setDocuments((prev) => [...prev, ...docs])
          : setDocuments(docs);
        setHasMore(
          data.pagination
            ? data.pagination.currentPage < data.pagination.totalPages
            : docs.length === 100,
        );
      } catch (e) {
        setError(e instanceof Error ? e : new Error("Unknown error"));
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchDocuments(1, false);
  }, [fetchDocuments]);

  const loadMore = useCallback(async () => {
    if (!isLoadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      await fetchDocuments(nextPage, true);
    }
  }, [page, hasMore, isLoadingMore, fetchDocuments]);

  const refresh = () => {
    setPage(1);
    fetchDocuments(1, false);
  };

  // no API key configured
  if (error?.message.includes("not configured")) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Memory Graph</h1>
            <p className="text-muted-foreground">
              Visualize AI memory and connections
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="py-12 text-center">
            <Network className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-medium mb-2">Supermemory Not Configured</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Add your SUPERMEMORY_API_KEY to the environment variables to
              enable the memory graph visualization.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Memory Graph</h1>
          <p className="text-muted-foreground">
            Visualize AI memory and connections
          </p>
        </div>
        <Button onClick={refresh} variant="outline" disabled={isLoading}>
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="h-[600px]">
          {isLoading && documents.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-destructive mb-4">{error.message}</p>
              <Button onClick={refresh} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          ) : documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Network className="h-12 w-12 mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No memories yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Start conversations to build your memory graph
              </p>
            </div>
          ) : (
            <MemoryGraph
              documents={documents}
              isLoading={isLoading}
              isLoadingMore={isLoadingMore}
              hasMore={hasMore}
              totalLoaded={documents.length}
              loadMoreDocuments={loadMore}
              variant="console"
            />
          )}
        </div>
      </Card>
    </div>
  );
}
