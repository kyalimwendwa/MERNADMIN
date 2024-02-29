
    function navigateToOrders() {
      window.location.href = "/orders";
    }
  
 
    function toggleDropdown(header) {
      const arrow = header.querySelector('.dropdown-arrow');
      const links = header.nextElementSibling; // Select the dropdown-links div associated with the clicked header
      const icon = header.querySelector('.bi');
  
      if (window.getComputedStyle(links).display === 'none') {
        links.style.display = 'block';
        arrow.style.transform = 'rotate(180deg)';
        icon.style.fill = '#457cdb'; // Change the fill color of the SVG
        header.style.color = '#457cdb'; // Change the text color
      } else {
        links.style.display = 'none';
        arrow.style.transform = 'rotate(0deg)';
        icon.style.fill = ''; // Reset the fill color of the SVG to default
        header.style.color = ''; // Reset the text color to default
      }
    }
 
    
    $(document).ready(function() {
      // Define the column IDs corresponding to the checkboxes
      var columnIds = {
        order: 0,
        date: 1,
        customer: 2,
        paymentStatus: 3,
        deliveryStatus: 4,
        paymentMethod: 5,
        actions: 6
      };
  
      // Set initial visibility based on checkbox state
      toggleColumnVisibility($('#toggleColumn_order'), columnIds.order);
      toggleColumnVisibility($('#toggleColumn_date'), columnIds.date);
      toggleColumnVisibility($('#toggleColumn_customer'), columnIds.customer);
      toggleColumnVisibility($('#toggleColumn_payment_status'), columnIds.paymentStatus);
      toggleColumnVisibility($('#toggleColumn_fulfillment_status'), columnIds.deliveryStatus);
      toggleColumnVisibility($('#toggleColumn_payment_method'), columnIds.paymentMethod);
      toggleColumnVisibility($('#toggleColumn_actions'), columnIds.actions);
  
      // Toggle column visibility when checkbox state changes
      $('.form-check-input').on('change', function() {
        var checkboxId = $(this).attr('id');
        var columnId = columnIds[checkboxId.substring(13)]; // Extract column ID from checkbox ID
        toggleColumnVisibility($(this), columnId);
      });
  
      function toggleColumnVisibility(checkbox, columnId) {
        var isChecked = checkbox.prop('checked');
        
        // Toggle visibility for the specific column in the table body
        $('table tr').each(function() {
          $(this).find('td:eq(' + columnId + ')').toggle(isChecked);
        });
  
        // Toggle visibility for the specific column in the table head
        $('table thead tr th:eq(' + columnId + ')').toggle(isChecked);
      }
    });
  