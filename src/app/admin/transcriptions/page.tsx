"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, AlertTriangle, CheckCircle, Trash2 } from "lucide-react";
import { Navbar } from "@/components/navbar";
import Link from "next/link";

interface CleanupResult {
  success: boolean;
  message: string;
  error?: string;
  result: {
    deleted: number;
    failed: number;
    keptCount: number;
    totalSize: number;
    deletedSize: number;
  };
  statsBefore: TranscriptionStats;
  statsAfter: TranscriptionStats;
}

interface TranscriptionStats {
  count: number;
  totalSize: number;
  oldestFile: string | null;
  newestFile: string | null;
  oldestTimestamp: number | null;
  newestTimestamp: number | null;
}

export default function TranscriptionsManagerPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<TranscriptionStats | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteResult, setDeleteResult] = useState<CleanupResult | null>(null);
  const [deleteAge, setDeleteAge] = useState("24");

  // Load stats
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "/api/maintenance/cleanup-transcriptions?maxAgeHours=0"
      );
      if (response.ok) {
        const data = await response.json();
        setStats(data.statsBefore);
      } else {
        console.error("Failed to fetch stats");
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const runCleanup = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(
        `/api/maintenance/cleanup-transcriptions?maxAgeHours=${deleteAge}`
      );
      if (response.ok) {
        const data = await response.json();
        setDeleteResult(data);
        setStats(data.statsAfter);
      } else {
        console.error("Failed to run cleanup");
      }
    } catch (error) {
      console.error("Error cleaning up:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Transcriptions Manager</h1>
          <Button asChild variant="outline" size="sm">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading statistics...</span>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Transcription Files</CardTitle>
                <CardDescription>
                  Statistics about stored transcription files
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Total Files
                      </p>
                      <p className="text-2xl font-bold">{stats?.count || 0}</p>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Total Size
                      </p>
                      <p className="text-2xl font-bold">
                        {formatBytes(stats?.totalSize || 0)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Oldest File:
                      </span>
                      <span className="text-sm font-medium">
                        {stats?.oldestFile || "None"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Oldest Date:
                      </span>
                      <span className="text-sm font-medium">
                        {formatDate(stats?.oldestTimestamp || null)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Newest File:
                      </span>
                      <span className="text-sm font-medium">
                        {stats?.newestFile || "None"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Newest Date:
                      </span>
                      <span className="text-sm font-medium">
                        {formatDate(stats?.newestTimestamp || null)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={fetchStats}
                  variant="outline"
                  className="w-full"
                >
                  Refresh Statistics
                </Button>
              </CardFooter>
            </Card>

            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Cleanup Transcriptions</CardTitle>
                <CardDescription>
                  Delete old transcription files to free up space
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium">
                      Delete files older than:
                    </p>
                    <Select value={deleteAge} onValueChange={setDeleteAge}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Select hours" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 hour</SelectItem>
                        <SelectItem value="6">6 hours</SelectItem>
                        <SelectItem value="12">12 hours</SelectItem>
                        <SelectItem value="24">1 day</SelectItem>
                        <SelectItem value="48">2 days</SelectItem>
                        <SelectItem value="72">3 days</SelectItem>
                        <SelectItem value="168">1 week</SelectItem>
                        <SelectItem value="0">All files</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={runCleanup}
                      disabled={isDeleting}
                      className="w-full"
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Cleaning...
                        </>
                      ) : (
                        <>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Run Cleanup
                        </>
                      )}
                    </Button>
                  </div>

                  {deleteResult && (
                    <div
                      className={`mt-4 p-4 rounded-md ${deleteResult.success ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}
                    >
                      {deleteResult.success ? (
                        <div className="flex items-start">
                          <CheckCircle className="h-5 w-5 mr-2" />
                          <div>
                            <p className="font-medium">
                              {deleteResult.message}
                            </p>
                            <p className="text-sm">
                              Files deleted: {deleteResult.result.deleted}
                            </p>
                            <p className="text-sm">
                              Files kept: {deleteResult.result.keptCount}
                            </p>
                            <p className="text-sm">
                              Space freed:{" "}
                              {formatBytes(deleteResult.result.deletedSize)}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start">
                          <AlertTriangle className="h-5 w-5 mr-2" />
                          <div>
                            <p className="font-medium">Cleanup failed</p>
                            <p className="text-sm">{deleteResult.error}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
