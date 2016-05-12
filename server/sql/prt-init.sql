grant connect to prt;
grant dba to prt;

meta.defineType 'prt.url';
meta.defineType 'prt.isSent:BOOLEAN';
meta.defineType 'prt.filename';
meta.defineType 'prt.fileSize:INTEGER';
meta.defineType 'prt.processingTime:INTEGER';

meta.defineEntity 'prt.Log',
 'url;status;filename;fileSize;processingTime'
;

meta.createTable 'prt.Log',0,1;
