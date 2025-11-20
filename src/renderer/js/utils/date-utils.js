 (function(global) {
   function formatDate(date) {
     if (!date) return 'N/A';
     try {
       return new Date(date).toLocaleDateString('pt-BR');
     } catch {
       return date;
     }
   }

   function formatDateTime(dateTime) {
     if (!dateTime) return 'N/A';
     try {
       return new Date(dateTime).toLocaleString('pt-BR');
     } catch {
       return dateTime;
     }
   }

   function getCurrentDateIso() {
     return new Date().toISOString().split('T')[0];
   }

   function daysSince(date) {
     if (!date) return 0;
     const start = new Date(date);
     const now = new Date();
     return Math.floor(Math.abs(now - start) / (1000 * 60 * 60 * 24));
   }

   global.DateUtils = {
     formatDate,
     formatDateTime,
     getCurrentDateIso,
     daysSince
   };
 })(window);
