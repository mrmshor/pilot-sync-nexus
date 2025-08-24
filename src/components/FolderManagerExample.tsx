import { useLocalFolders } from '../hooks/useLocalFolders';
import { Button } from './ui/button';
import { FolderOpen, Download } from 'lucide-react';
import { logger } from '../utils/logger';

export const FolderManagerExample = () => {
  const { 
    selectFolder, 
    openFolder, 
    showItemInFolder,
    attemptAutoOpen,
    
    isTauri 
  } = useLocalFolders();

  // בחירת תיקיה
  const handleFolderSelect = async () => {
    const folderPath = await selectFolder();
    if (folderPath) {
      logger.info('Selected folder:', folderPath);
      // שמירת הנתיב במצב הקומפוננטה או במסד נתונים
    }
  };

  // פתיחת תיקיה בסייר הקבצים
  const handleOpenFolder = async (folderPath: string) => {
    const success = await openFolder(folderPath);
    if (!success) {
      logger.error('Failed to open folder:', folderPath);
    }
  };

  // הצגת פריט בתיקיה (highlight specific file/folder)
  const handleShowInFolder = async (itemPath: string) => {
    const success = await showItemInFolder(itemPath);
    if (!success) {
      logger.error('Failed to show item in folder:', itemPath);
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

      </div>

      <div className="text-sm text-muted-foreground">
        <p>🌐 פועל בדפדפן - קישורים יפתחו בטאב חדש</p>
      </div>
    </div>
  );
};