import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Upload, CheckCircle, AlertCircle } from "lucide-react";

export const DataImportButton = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const { toast } = useToast();

  const runDataImport = async () => {
    setIsImporting(true);
    setImportResult(null);
    
    try {
      // Read the SQL file content
      const sqlResponse = await fetch('/scripts/mysql-import-data.sql');
      const sqlContent = await sqlResponse.text();
      
      toast({
        title: "Import Starting",
        description: "Reading MySQL data and starting import process...",
      });

      // Call the edge function to import data
      const response = await fetch(
        'https://ughpjilxcagxyjjnojkk.supabase.co/functions/v1/import-data',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnaHBqaWx4Y2FneHlqam5vamtrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5NTE5NjAsImV4cCI6MjA3MzUyNzk2MH0.qxYDf3vUlh34I6mfOXeMS1Bz2v7w_FX3TqYNO_jWJ_4'}`
          },
          body: JSON.stringify({ sqlContent })
        }
      );

      const result = await response.json();
      
      if (result.success) {
        setImportResult(result.results);
        toast({
          title: "Import Completed! ✅",
          description: `Successfully imported ${result.results.members.imported} members, ${result.results.images.imported} images, ${result.results.likes.imported} likes, and ${result.results.messages.imported} messages.`,
        });
      } else {
        throw new Error(result.error || 'Import failed');
      }
      
    } catch (error: any) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card className="p-6 max-w-md mx-auto">
      <div className="text-center mb-4">
        <Upload className="w-12 h-12 mx-auto mb-2 text-primary" />
        <h3 className="text-lg font-bold">Import MySQL Data</h3>
        <p className="text-muted-foreground text-sm">
          Import all your existing users, images, likes, and messages
        </p>
      </div>

      {!importResult && (
        <Button 
          onClick={runDataImport}
          disabled={isImporting}
          className="w-full"
          size="lg"
        >
          {isImporting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Importing Data...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Start Import
            </>
          )}
        </Button>
      )}

      {isImporting && (
        <div className="mt-4">
          <Progress value={33} className="mb-2" />
          <p className="text-xs text-muted-foreground text-center">
            Processing MySQL data and importing to Supabase...
          </p>
        </div>
      )}

      {importResult && (
        <div className="mt-4 space-y-3">
          <div className="flex items-center text-green-600">
            <CheckCircle className="w-5 h-5 mr-2" />
            <span className="font-semibold">Import Completed Successfully!</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-green-50 p-2 rounded">
              <div className="font-semibold">Members</div>
              <div className="text-green-600">✅ {importResult.members.imported}</div>
              {importResult.members.skipped > 0 && (
                <div className="text-orange-600">⚠️ {importResult.members.skipped} skipped</div>
              )}
            </div>
            
            <div className="bg-blue-50 p-2 rounded">
              <div className="font-semibold">Images</div>
              <div className="text-blue-600">✅ {importResult.images.imported}</div>
              {importResult.images.skipped > 0 && (
                <div className="text-orange-600">⚠️ {importResult.images.skipped} skipped</div>
              )}
            </div>
            
            <div className="bg-purple-50 p-2 rounded">
              <div className="font-semibold">Likes</div>
              <div className="text-purple-600">✅ {importResult.likes.imported}</div>
              {importResult.likes.skipped > 0 && (
                <div className="text-orange-600">⚠️ {importResult.likes.skipped} skipped</div>
              )}
            </div>
            
            <div className="bg-pink-50 p-2 rounded">
              <div className="font-semibold">Messages</div>
              <div className="text-pink-600">✅ {importResult.messages.imported}</div>
              {importResult.messages.skipped > 0 && (
                <div className="text-orange-600">⚠️ {importResult.messages.skipped} skipped</div>
              )}
            </div>
          </div>

          <div className="bg-yellow-50 p-3 rounded mt-4">
            <div className="flex items-start">
              <AlertCircle className="w-4 h-4 text-yellow-600 mr-2 mt-0.5" />
              <div className="text-xs text-yellow-800">
                <div className="font-semibold mb-1">Next Steps:</div>
                <ul className="list-disc list-inside space-y-1">
                  <li>Users will need to reset passwords to access Supabase Auth</li>
                  <li>All profile data and relationships are preserved</li>
                  <li>Images and messages are linked to correct members</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};