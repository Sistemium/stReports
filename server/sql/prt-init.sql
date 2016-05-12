grant connect to prt;
grant dba to prt;

util.setUserOption 'asamium.default.domain', 'prt';

meta.defineType 'url';
meta.defineType 'isConnectionAborted:BOOL';
meta.defineType 'filename';
meta.defineType 'fileSize:INTEGER';
meta.defineType 'processingTime:INTEGER';

meta.defineEntity 'Log',
 'url;isConnectionAborted;filename;fileSize;processingTime'
;

meta.createTable 'Log',0,1;
