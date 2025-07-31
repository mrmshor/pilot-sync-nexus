import { useLocalFolders } from '../hooks/useLocalFolders';
import { Button } from './ui/button';
import { FolderOpen, Download } from 'lucide-react';

export const FolderManagerExample = () => {
  const { 
    selectFolder, 
    openFolder, 
    showItemInFolder,
    attemptAutoOpen,
    downloadHelperFiles,
    isTauri 
  } = useLocalFolders();

  // בחירת תיקיה
  const handleFolderSelect = async () => {
    const folderPath = await selectFolder();
    if (folderPath) {
      console.log('Selected folder:', folderPath);
      // שמירת הנתיב במצב הקומפוננטה או במסד נתונים
    }
  };

  // פתיחת תיקיה בסייר הקבצים
  const handleOpenFolder = async (folderPath: string) => {
    const success = await openFolder(folderPath);
    if (!success) {
      console.error('Failed to open folder:', folderPath);
    }
  };

  // הצגת פריט בתיקיה (highlight specific file/folder)
  const handleShowInFolder = async (itemPath: string) => {
    const success = await showItemInFolder(itemPath);
    if (!success) {
      console.error('Failed to show item in folder:', itemPath);
    }
  };

  // הורדת קבצי עזר
  const handleDownloadHelpers = async () => {
    const success = await downloadHelperFiles();
    if (success) {
      console.log('Helper files downloaded successfully');
    }
  };

  return (
    <div className="space-y-4 p-4">
      <h3 className="text-lg font-semibold">ניהול תיקיות</h3>
      
      <div className="flex flex-wrap gap-2">
        <Button onClick={handleFolderSelect}>
          <FolderOpen className="w-4 h-4 mr-2" />
          בחר תיקיה
        </Button>

        <Button 
          onClick={() => handleOpenFolder('/Users/username/Documents')}
          variant="outline"
        >
          פתח תיקיית דוגמה
        </Button>

        <Button 
          onClick={() => handleShowInFolder('/Users/username/Documents/file.txt')}
          variant="outline"
        >
          הצג קובץ בתיקיה
        </Button>

        {!isTauri && (
          <Button 
            onClick={handleDownloadHelpers}
            variant="outline"
          >
            <Download className="w-4 h-4 mr-2" />
            הורד קבצי עזר
          </Button>
        )}
      </div>

      <div className="text-sm text-muted-foreground">
        {isTauri ? (
          <p>🚀 פועל באפליקציית שולחן עבודה - תמיכה מלאה בפתיחת תיקיות</p>
        ) : (
          <p>🌐 פועל בדפדפן - תמיכה מוגבלת, השתמש בקבצי העזר לפתיחת תיקיות</p>
        )}
      </div>
    </div>
  );
};