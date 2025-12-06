
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

import { FileText, Trash2, UploadCloud, Download, Loader2, X, File as FileIcon, PlusCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Matches the expected API response structure
export type Policy = {
  id: number;
  filename: string;
  original_filename: string;
  description: string | null;
  file_size: number;
  upload_date: string;
};

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingPolicies, setIsLoadingPolicies] = useState(true);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const fetchPolicies = async () => {
    setIsLoadingPolicies(true);
    const authToken = localStorage.getItem('accessToken');
    if (!authToken) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "Please log in to view policies.",
      });
      setIsLoadingPolicies(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/pdfs/`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPolicies(data);
      } else {
        toast({
          variant: "destructive",
          title: "Failed to Fetch Policies",
          description: "Could not retrieve the list of policies.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Network Error",
        description: "Failed to connect to the server.",
      });
    } finally {
      setIsLoadingPolicies(false);
    }
  };

  useEffect(() => {
    setIsClient(true);
    fetchPolicies();
  }, []);

  const handleDelete = async (policyId: number) => {
    setDeletingId(policyId);
    const authToken = localStorage.getItem('accessToken');
    if (!authToken) {
        toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "You must be logged in to delete files.",
        });
        setDeletingId(null);
        return;
    }

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/pdfs/${policyId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`,
            },
        });

        if (response.ok) {
            setPolicies(policies.filter((p) => p.id !== policyId));
            toast({
                title: "Policy Deleted",
                description: "The policy file has been successfully removed.",
            });
        } else {
            const errorData = await response.json();
            toast({
                variant: "destructive",
                title: "Deletion Failed",
                description: errorData.detail || "Could not delete the policy.",
            });
        }
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Network Error",
            description: "Failed to connect to the server while deleting the policy.",
        });
    } finally {
        setDeletingId(null);
    }
  };

  const handleFile = (file: File | null) => {
    if (file) {
      if (file.type === "application/pdf") {
        setFileToUpload(file);
      } else {
        toast({
          variant: "destructive",
          title: "Invalid File Type",
          description: "Please upload a PDF file.",
        });
        setFileToUpload(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    } else {
      setFileToUpload(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFile(event.target.files ? event.target.files[0] : null);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      handleFile(event.dataTransfer.files[0]);
    }
  };
  
  const handleUpload = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!fileToUpload) return;
    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', fileToUpload);
    formData.append('description', '');

    const authToken = localStorage.getItem('accessToken');
    
    if (!authToken) {
        toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "You must be logged in to upload files.",
        });
        setIsUploading(false);
        return;
    }

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/pdfs/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
            },
            body: formData,
        });

        if (response.ok) {
            toast({
                title: "Upload Successful",
                description: `${fileToUpload.name} has been uploaded.`,
            });
            handleFile(null);
            fetchPolicies();
            setIsUploadModalOpen(false); // Close modal on success
        } else {
            const errorData = await response.json();
            toast({
                variant: "destructive",
                title: "Upload Failed",
                description: errorData.detail || "An unexpected error occurred.",
            });
        }
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Upload Failed",
            description: "Failed to connect to the server. Please try again later.",
        });
    } finally {
        setIsUploading(false);
    }
  };

  const handleDownload = async (policyId: number, filename: string) => {
    setDownloadingId(policyId);
    const authToken = localStorage.getItem('accessToken');
    if (!authToken) {
        toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "You must be logged in to download files.",
        });
        setDownloadingId(null);
        return;
    }

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/pdfs/${policyId}/download`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
            },
        });

        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } else {
            const errorData = await response.json();
            toast({
                variant: "destructive",
                title: "Download Failed",
                description: errorData.detail || "Could not download the file.",
            });
        }
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Network Error",
            description: "Failed to connect to the server while downloading the file.",
        });
    } finally {
        setDownloadingId(null);
    }
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Company Policies</h1>
            <p className="text-muted-foreground">
            Manage your company's internal policy documents.
            </p>
        </div>
        <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Upload New Policy
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                <DialogTitle>Upload New Policy</DialogTitle>
                <DialogDescription>
                    Upload a new company policy. Only PDF files are accepted.
                </DialogDescription>
                </DialogHeader>
                <div 
                    className={cn(
                        "relative flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-background p-12 text-center transition-colors",
                        isDragging && "border-primary bg-accent",
                        fileToUpload && "p-6",
                        !fileToUpload && "cursor-pointer hover:border-primary"
                    )}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => !fileToUpload && fileInputRef.current?.click()}
                    >
                    <Input 
                        ref={fileInputRef}
                        id="policy-upload" 
                        type="file" 
                        accept="application/pdf" 
                        onChange={handleFileChange}
                        className="hidden"
                    />

                    {fileToUpload ? (
                        <div className="flex flex-col items-center gap-4">
                            <div className="flex items-center gap-3 rounded-lg border bg-muted p-3">
                                <FileIcon className="h-6 w-6 text-primary" />
                                <span className="font-medium text-sm">{fileToUpload.name}</span>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-7 w-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleFile(null);
                                    }}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                            <Button onClick={handleUpload} disabled={!fileToUpload || isUploading} size="lg">
                                {isUploading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <UploadCloud className="mr-2 h-4 w-4" />
                                )}
                                {isUploading ? "Uploading..." : "Upload File"}
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <UploadCloud className={cn("h-12 w-12", isDragging && "text-primary")} />
                            <p className="font-medium">
                                Drag & drop your file here, or{" "}
                                <span className="font-semibold text-primary">
                                    click to select
                                </span>
                            </p>
                            <p className="text-xs">Only PDF files are accepted.</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Uploaded Policies</CardTitle>
          <CardDescription>
            A list of all company policies.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Type</TableHead>
                <TableHead>File Name</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Upload Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingPolicies ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-6 w-6 rounded" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : policies.length > 0 ? (
                policies.map((policy) => {
                  const isDownloading = downloadingId === policy.id;
                  const isDeleting = deletingId === policy.id;
                  return (
                    <TableRow key={policy.id}>
                      <TableCell>
                        <FileText className="h-6 w-6 text-destructive" />
                      </TableCell>
                      <TableCell className="font-medium">
                         {policy.original_filename}
                      </TableCell>
                      <TableCell>{formatBytes(policy.file_size)}</TableCell>
                      <TableCell>{formatDate(policy.upload_date)}</TableCell>
                      <TableCell className="text-right">
                        {isClient && (
                          <div className="flex items-center justify-end gap-2">
                             <Button variant="ghost" size="icon" aria-label="Download policy" onClick={() => handleDownload(policy.id, policy.original_filename)} disabled={isDownloading}>
                               {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                             </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" aria-label="Delete policy" disabled={isDeleting}>
                                    {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                  </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                  <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                      This action cannot be undone. This will permanently delete the policy file &quot;{policy.original_filename}&quot;.
                                  </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(policy.id)} disabled={isDeleting}>
                                      {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                      Delete
                                  </AlertDialogAction>
                                  </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No policies found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
