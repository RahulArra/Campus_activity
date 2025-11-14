# TODO: Add Rollno Field to User Registration and Exports

## Backend Changes
- [x] Update `backend/models/user.model.js` to add `rollno` field as required string
- [x] Update `backend/routes/auth.routes.js` to handle `rollno` in signup and return it in login response
- [x] Update `backend/routes/submission.routes.js` to include `rollno` in user populate fields
- [x] Update `backend/controllers/export.controller.js` to add `rollno` to CSV fields and PDF table by populating from User
- [x] Update `backend/controllers/report.controller.js` to include `rollno` in department report responses

## Frontend Changes
- [x] Update `frontend/src/pages/RegisterPage.jsx` to add rollno input field with validation

## Testing
- [ ] Test registration with rollno field
- [ ] Verify rollno appears in login response and submissions
- [ ] Test export CSV includes rollno
- [ ] Test export PDF includes rollno
- [ ] Check reports include rollno
