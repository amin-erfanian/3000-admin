import * as XLSX from 'xlsx';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { toast } from 'vue3-toastify';

const TYPES = {
  expense: 'خرج',
  income: 'درآمد',
  transfer: 'جیب به جیب',
};

class TransactionExporter {
  /**
   * Convert transactions to XLSX workbook
   * @param {Array} transactions - Array of transaction objects
   * @param {string} filterDescription - String of description for filters
   * @returns {Object} XLSX workbook
   */
  createWorkbook(transactions, filterDescription) {
    // Create worksheet data
    const wsData = [
      // Title row
      [`فیلترهای اعمال شده: ${filterDescription}`],
      [`تعداد تراکنش‌ها: ${transactions.length}`],
      [], // Empty row for spacing
      [], // Empty row for spacing
      // Headers
      [
        'توضیحات',
        'مانده حساب مبدا بعد از تراکنش',
        'مقصد',
        'منبع',
        'واحد پولی',
        'مبلغ',
        'دسته‌بندی',
        'نوع تراکنش',
        'تاریخ',
        'ردیف',
      ],

      // Transaction data
      ...transactions.map((tx, index) => [
        tx.description || '',
        tx.remainingResourceBalance,
        tx.destination?.name || '',
        tx.resource?.name || '',
        tx.resource?.currency || '',
        tx.amount,
        tx.category?.name || '',
        TYPES[tx.type],
        tx.date,
        index + 1,
      ]),
    ];

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Merge title cells (A1:H1)
    if (!ws['!merges']) ws['!merges'] = [];
    ws['!merges'].push(
      { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } }, // Merge filter description
      { s: { r: 1, c: 0 }, e: { r: 1, c: 9 } }, // Merge transaction count
    );

    // Set column widths
    ws['!cols'] = [
      { wch: 30 }, // Description
      { wch: 15 }, // Balance
      { wch: 15 }, // Destination
      { wch: 15 }, // Resource
      { wch: 10 }, // Currency
      { wch: 15 }, // Amount
      { wch: 20 }, // Category
      { wch: 15 }, // Type
      { wch: 15 }, // Date
      { wch: 8 }, // Index
    ];

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'تراکنش‌ها');

    return wb;
  }

  /**
   * Export transactions to XLSX file
   * @param {Array} transactions - Array of transaction objects
   * @param {string} filterDescription - String of description for filters
   * @param {string} fileName - Output file name
   */
  async exportToXLSX(transactions, filterDescription, fileName = 'تراکنش‌ها') {
    try {
      const wb = this.createWorkbook(transactions, filterDescription);
      const fullFileName = `${fileName} - ${filterDescription}.xlsx`;

      // Check if running in Capacitor native platform
      if (Capacitor.isNativePlatform()) {
        // Convert workbook to base64
        const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });

        // Sanitize filename for filesystem (remove special characters)
        const sanitizedFileName = fullFileName.replace(/[<>:"/\\|?*]/g, '_');

        // Ensure parent directory exists (Android will fail with: "Parent folder doesn't exist")
        // Note: Directory.Data is app-internal storage and does not require runtime permissions.
        try {
          await Filesystem.mkdir({
            path: 'backup',
            directory: Directory.Data,
            recursive: true,
          });
        } catch (_) {
          // Ignore errors (e.g. directory already exists)
        }

        // Write file to device storage (base64 data for binary files)
        const filePath = `backup/${sanitizedFileName}`;
        await Filesystem.writeFile({
          path: filePath,
          data: wbout,
          directory: Directory.Data,
        });

        // Get file URI and share it
        const fileUri = await Filesystem.getUri({
          path: filePath,
          directory: Directory.Data,
        });

        // Share the file
        await Share.share({
          title: 'پشتیبان گیری تراکنش‌ها',
          text: `فایل پشتیبان گیری تراکنش‌ها: ${fullFileName}`,
          url: fileUri.uri,
          dialogTitle: 'اشتراک‌گذاری فایل پشتیبان',
        });

        toast.success('فایل با موفقیت ایجاد و آماده اشتراک‌گذاری شد');
      } else {
        // Web platform - use browser download
        XLSX.writeFile(wb, fullFileName);
        toast.success('فایل با موفقیت دانلود شد');
      }
    } catch (error) {
      console.error('Error exporting XLSX:', error);
      toast.error('خطا در ایجاد فایل پشتیبان. لطفا دوباره تلاش کنید.');
      throw error;
    }
  }

  /**
   * Placeholder for restore function
   * @param {File} file - XLSX file to restore from
   * @returns {Promise<Array>} Array of transaction objects
   */
  async restoreFromXLSX(file) {
    // reserved for future restore implementation
    void file;
    // TODO: Implement restore functionality
    throw new Error('Restore functionality not yet implemented');
  }
}

export const exporter = new TransactionExporter();
