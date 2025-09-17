import { DataImportButton } from "@/components/DataImportButton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Database, Users } from "lucide-react";
import { Link } from "react-router-dom";

const AdminImport = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link to="/">
            <Button variant="ghost" size="sm" className="mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to App
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Database className="w-8 h-8 mr-3 text-primary" />
              Admin Data Import
            </h1>
            <p className="text-muted-foreground">
              Import your existing MySQL database to Supabase
            </p>
          </div>
        </div>

        {/* Warning Card */}
        <Card className="p-6 mb-8 border-orange-200 bg-orange-50">
          <div className="flex items-start">
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center mr-4">
              ⚠️
            </div>
            <div>
              <h3 className="font-bold text-orange-800 mb-2">Important Information</h3>
              <div className="text-orange-700 text-sm space-y-2">
                <p>• This will import all your existing users, images, likes, and messages</p>
                <p>• Users will need to reset their passwords to access the new system</p>
                <p>• All existing relationships and data will be preserved</p>
                <p>• This operation should only be run once</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Import Component */}
        <div className="mb-8">
          <DataImportButton />
        </div>

        {/* Instructions */}
        <Card className="p-6">
          <h3 className="font-bold mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Post-Import User Migration Process
          </h3>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">1. User Communication</h4>
              <p className="text-muted-foreground">
                Notify your users about the migration and that they'll need to reset their passwords to continue using the platform.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">2. Password Reset Flow</h4>
              <p className="text-muted-foreground">
                Users should use the "Forgot Password" option on the login page with their original email address to set up Supabase authentication.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">3. Account Linking</h4>
              <p className="text-muted-foreground">
                When users complete Supabase signup, the system will automatically link their new account to their existing profile and data.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">4. Data Verification</h4>
              <p className="text-muted-foreground">
                After import, verify that all user data, relationships, and images are correctly preserved and accessible.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminImport;