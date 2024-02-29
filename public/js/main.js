const updateBtns = document.querySelectorAll('#update-btn');
const deleteBtns = document.querySelectorAll('#delete-btn');
const cancelBtns = document.querySelectorAll('#cancel-btn');
const saveBtns = document.querySelectorAll('#save-btn');

updateBtns.forEach(updateBtn => {
  updateBtn.addEventListener('click', _ => {
    // get the id from url parameter
    const contactId = updateBtn.dataset.id;
    console.log('clicked UPDATE btn', contactId);
    window.location.href =`/contacts/${contactId}/edit`;
  });
})

function getEditFormData() {
  const form = document.getElementById('editContactForm');
  const contactFormData = {}
  const editForm = new FormData(form);
  for(const [key, val] of editForm.entries()) {
    contactFormData[key] = val;
  }
  console.log(contactFormData)
  return contactFormData;
}

// handle when a user clicks "Save Changes" on the Edit Quote page
saveBtns.forEach(saveBtn => {
  saveBtn.addEventListener("click", _=> {
    const contactId = saveBtn.dataset.id;
    const contactUpdatedData = getEditFormData();
    // send PUT request to server with updated information
    fetch(`/contacts/${contactId}`,{
      method: 'PUT',
      headers:{
        'Content-Type': 'application/json'
      },
      // body: JSON.stringify(contactUpdatedData)
      }).then(_=> {
        alert('Your changes have been saved!')
      })
      .catch(err => console.error(err))
  })

});


cancelBtns.forEach(cancelBtn => {
  cancelBtn.addEventListener('click', _ => {

  });
});

deleteBtns.forEach(deleteBtn => {
  deleteBtn.addEventListener('click', _ => {
    const contactId = deleteBtn.dataset.id;
    // const contactDeleteData = getEditFormData();
    console.log(contactId)
    fetch(`/contacts/${contactId}/delete`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      // body: JSON.stringify(contactDeleteData)
    })
      .then(res => {
        if (res.ok) {
          console.log(res)
          return res.json()
        }
      })
      .then(data => {
        console.log('Deleted:', data)
        alert('Your changes have been saved!')
      })
      .catch(err => {
        console.error(err);
        alert('An error occurred while deleting the contact. Please try again later.'); 
      })
  });
});