-- สคริปต์แก้ไขข้อมูล null ในตาราง spareparts
UPDATE spareparts SET quantity = 0 WHERE quantity IS NULL;
UPDATE spareparts SET min_stock = 0 WHERE min_stock IS NULL;
