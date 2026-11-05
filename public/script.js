const courseList = document.querySelector('#course-list');
const statusText = document.querySelector('#status');
const courseForm = document.querySelector('#course-form');
const courseName = document.querySelector('#course-name');
const courseCredits = document.querySelector('#course-credits');
const submitBtn = document.querySelector('#submit-btn');
const editSection = document.querySelector('#edit-section');
const editForm = document.querySelector('#edit-form');
const editName = document.querySelector('#edit-name');
const editCredits = document.querySelector('#edit-credits');
const cancelEditBtn = document.querySelector('#cancel-edit-btn');

let editingCourseId = null;

// Get all courses
async function loadCourses() {
    try {
        statusText.textContent = 'Loading courses...';

        const response = await fetch('/api/courses');

        if (!response.ok) {
            throw new Error('Failed to load courses');
        }

        const courses = await response.json();

        // Clear old data
        courseList.innerHTML = '';

        // Show empty message
        if (courses.length === 0) {
            courseList.innerHTML = `
                <tr>
                    <td colspan="4">No courses found.</td>
                </tr>
            `;
            statusText.textContent = 'No courses available';
            return;
        }

        // Display each course
        courses.forEach(course => {
            const row = document.createElement('tr');

            const idCell = document.createElement('td');
            idCell.textContent = course.id;

            const nameCell = document.createElement('td');
            nameCell.textContent = course.name;

            const creditsCell = document.createElement('td');
            creditsCell.textContent = course.credits;

            const actionCell = document.createElement('td');

            const editBtn = document.createElement('button');
            editBtn.textContent = 'Edit';
            editBtn.classList.add('action-btn', 'edit-btn');

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.classList.add('action-btn', 'delete-btn');

            editBtn.addEventListener('click', () => {
                editingCourseId = course.id;

                editName.value = course.name;
                editCredits.value = course.credits;

                editSection.hidden = false;

                editSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            });

            // Delete a course
            deleteBtn.addEventListener('click', async () => {

                // Ask for confirmation on the first click
                if (deleteBtn.dataset.confirm === 'true') {
                    // Confirm deletion
                } else {
                    deleteBtn.dataset.confirm = 'true';
                    deleteBtn.textContent = 'Confirm?';
                    statusText.textContent = 'Click Confirm? again to delete this course.';
                    return;
                }

                try {
                    deleteBtn.disabled = true;
                    deleteBtn.textContent = 'Deleting...';
                    statusText.textContent = 'Deleting course...';

                    const response = await fetch(`/api/courses/${course.id}`, {
                        method: 'DELETE'
                    });

                    const result = await response.json();

                    if (!response.ok) {
                        throw new Error(result.error || 'Failed to delete course');
                    }

                    await loadCourses();

                    statusText.textContent = 'Course deleted successfully!';

                } catch (error) {
                    console.error(error);
                    statusText.textContent = error.message;

                    deleteBtn.disabled = false;
                    deleteBtn.textContent = 'Delete';
                    deleteBtn.dataset.confirm = 'false';
                }
            });
            actionCell.append(editBtn, deleteBtn);

            row.append(
                idCell,
                nameCell,
                creditsCell,
                actionCell
            );

            courseList.appendChild(row);
        });

        statusText.textContent = `${courses.length} courses found`;

    } catch (error) {
        console.error(error);
        statusText.textContent = error.message || 'Failed to load courses';
    }
}

// Load courses when page opens
loadCourses();

// Update an existing course
editForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (editingCourseId === null) return;

    const name = editName.value.trim();
    const credits = Number(editCredits.value);

    try {
        statusText.textContent = 'Updating course...';

        const response = await fetch(`/api/courses/${editingCourseId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                credits: credits
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Failed to update course');
        }

        statusText.textContent = 'Course updated successfully!';

        editForm.reset();
        editSection.hidden = true;
        editingCourseId = null;

        await loadCourses();

        statusText.textContent = 'Course updated successfully!';

    } catch (error) {
        console.error(error);
        statusText.textContent = error.message;
    }
});

cancelEditBtn.addEventListener('click', () => {
    editForm.reset();
    editSection.hidden = true;
    editingCourseId = null;
});

// Add a new course
courseForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const name = courseName.value.trim();
    const credits = Number(courseCredits.value);

    try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Adding...';
        statusText.textContent = 'Adding course...';

        const response = await fetch('/api/courses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                credits: credits
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Failed to add course');
        }

        statusText.textContent = 'Course added successfully!';

        courseForm.reset();

        // Reload course list
        await loadCourses();

        statusText.textContent = 'Course added successfully!';

    } catch (error) {
        console.error(error);
        statusText.textContent = error.message;

    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Add Course';
    }
});
