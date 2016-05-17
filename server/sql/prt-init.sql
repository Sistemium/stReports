grant connect to prt;
grant dba to prt;

util.setUserOption 'asamium.default.domain', 'prt';

meta.defineType 'url';
meta.defineType 'isConnectionAborted:BOOL';
meta.defineType 'filename';
meta.defineType 'fileUrl';
meta.defineType 'fileSize:INTEGER,,nullable';
meta.defineType 'processingTime:INTEGER,,nullable';

meta.defineEntity 'Log',
 'url;isConnectionAborted;fileUrl;filename;fileSize;processingTime'
;

meta.createTable 'Log',0,1;
