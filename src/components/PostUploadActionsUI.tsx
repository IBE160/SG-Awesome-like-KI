// src/components/PostUploadActionsUI.tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface PostUploadActionsUIProps {
  documentId: string; // The ID of the newly uploaded document
  onGenerateSummary: (documentId: string) => void;
  onGenerateQuiz: (documentId: string) => void;
  onViewDocument: (documentId: string) => void; // Optional: To view the raw document
}

export function PostUploadActionsUI({
  documentId,
  onGenerateSummary,
  onGenerateQuiz,
  onViewDocument,
}: PostUploadActionsUIProps) {
  return (
    <Card className="w-[350px] mx-auto mt-8">
      <CardHeader>
        <CardTitle>Document Uploaded!</CardTitle>
        <CardDescription>What would you like to do next?</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid w-full items-center gap-4">
          <Button onClick={() => onGenerateSummary(documentId)} className="w-full">
            Generate Summary
          </Button>
          <Button onClick={() => onGenerateQuiz(documentId)} className="w-full" variant="outline">
            Generate Quiz
          </Button>
          <Button onClick={() => onViewDocument(documentId)} className="w-full" variant="ghost">
            View Document
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center text-sm text-muted-foreground">
        Your document ID: {documentId}
      </CardFooter>
    </Card>
  );
}
