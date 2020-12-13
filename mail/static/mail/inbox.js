document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').onsubmit =  send_mail;
  
  
  // By default, load the inbox
  load_mailbox('inbox');
});




function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}




function load_mailbox(mailbox) {

  // clear email views
  document.querySelector('#emails-rows').innerHTML = "";

  // Show the mailbox and hide other views
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'block';

  // Show the mailbox name
  document.querySelector('#sectionName').innerHTML = mailbox;

  // Load the emails
  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
      // Print emails
      console.log(emails);

      // ... do something else with emails ...
      render_emails(emails);

      // const emails_view = document.querySelector('#emails-view');

      document.querySelectorAll('.email-row').forEach(item => {
        item.addEventListener('click', function () { render_email(`${item.id}`)});
      });
    });

}




function send_mail() {
  let recipients = document.querySelector('#compose-recipients').value;
  let subject = document.querySelector('#compose-subject').value;
  let body = document.querySelector('#compose-body').value;

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
    })
  })
  .then(response => response.json())
  .then(result => {
    // Print result
    console.log(result);
  });

  load_mailbox('sent');

  return false;
}


function render_emails(emails) {

  let i = 0;
  emails.forEach(e => {

    // container to hold email-row and buttons
    const cont0 = document.createElement('div');
    cont0.classList.add('container0');

    const email = document.createElement('div');
    email.classList.add('email-row');
    // When click on a single email
    email.id = e.id;
    const from = document.createElement('div');
    from.classList.add('from');
    const subject = document.createElement('div');
    subject.classList.add('subject');
    const time = document.createElement('div');
    time.classList.add('time');

    

    if(e.read === true) {
      email.classList.add('email-read');
    }



    from.innerHTML = e.sender; 
    subject.innerHTML = e.subject;
    time.innerHTML = e.timestamp; 

    email.append(from);
    email.append(subject);
    email.append(time);

    cont0.append(email);

    // for inbox only
    if (document.querySelector('#sectionName').innerHTML === "inbox") {
      const button = document.createElement('button');
      button.classList.add('btn', 'btn-sm', 'btn-outline-primary')
      button.innerHTML = "Archive";
      button.addEventListener('click', function () { archive(`${email.id}`) });
      cont0.append(button);
    }

    // for archive only
    if (document.querySelector('#sectionName').innerHTML === "archive") {
      const button = document.createElement('button');
      button.innerHTML = "Un-Archive";
      button.addEventListener('click', function () { un_archive(`${email.id}`)});
      cont0.append(button);
    }


    document.querySelector('#emails-rows').append(cont0);

    
  });
}




function archive(id) {
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: true
    })
  })
  .then(load_mailbox('inbox'));
}

function un_archive(id) {
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: false
    })
  })
    .then(load_mailbox('archive'));
}




function render_email(id) {

  if(id == '') {
    return;
  }

  fetch(`/emails/${id}`)
    .then(response => response.json())
    .then(email => {
      // Print email
      console.log(email);

      // Show the mailbox and hide other views
      document.querySelector('#compose-view').style.display = 'none';
      document.querySelector('#emails-view').style.display = 'none';
      document.querySelector('#email-view').style.display = 'block';

      // ... do something else with email ...
      let from = document.querySelector('#email-from');
      let recipients = document.querySelector("#email-recipients");
      let subject = document.querySelector('#email-subject');
      let body = document.querySelector('#email-body');
      let timestamp = document.querySelector('#email-timestamp');


      recipients.innerHTML = email.recipients;
      from.innerHTML = email.sender;
      subject.innerHTML = email.subject; 
      body.innerHTML = email.body; 
      timestamp.innerHTML = email.timestamp;


      // let button = document.createElement('button');
      button = document.querySelector("#replay-button");
      button.addEventListener('click', function () { replay_email(`${email.id}`, `${email.subject}`, `${email.sender}`, `${email.timestamp}`, `${email.body}`) });
      
      // update email status: read = true
      fetch(`/emails/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          read: true
        })
      })

    });

  console.log(`${id}`);
}


function replay_email(id, subject, from, timestamp, body) {
  compose_email();
  // Clear out composition fields
  document.querySelector('#compose-recipients').value = from;
  document.querySelector('#compose-body').value = "On " + timestamp + " " + from + " wrote: " + body;
  if(subject.split(" ", 1)[0] === "Re:") {
    document.querySelector('#compose-subject').value =  subject;
  }
  else {
    document.querySelector('#compose-subject').value = "Re: " + subject;
  }

}