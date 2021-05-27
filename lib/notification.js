
            
           export function showNotification(status, title, text, autoClose) {
                new Notify ({
                    status: status,
                    title: title,
                    text: text,
                    effect: 'fade',
                    speed: 300,
                    customClass: null,
                    customIcon: null,
                    showIcon: true,
                    showCloseButton: true,
                    autoclose: autoClose,
                    autotimeout: 3000,
                    gap: 20,
                    distance: 20,
                    type: 1,
                    position: 'right top'
                });
                
            }