UPDATE users
SET position = 'OPERATOR'
WHERE email = 'recruiter@demo.com';

DELETE FROM user_permission
WHERE user_id = (
    SELECT id FROM users WHERE email = 'recruiter@demo.com'
);

INSERT INTO user_permission (user_id, permission_id)
SELECT u.id, p.id
FROM users u
JOIN permission p ON p.description IN (
    'SEARCH_USER',
    'SEARCH_PRODUCT',
    'REGISTER_STOCK_MOVEMENT'
)
WHERE u.email = 'recruiter@demo.com';