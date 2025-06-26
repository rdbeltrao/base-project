import { User } from "@test-pod/database";
import type { SessionUser } from "@test-pod/database";

export async function getUserForSession(userId: number): Promise<SessionUser | null> {
    const user = await User.findByPk(userId, {
        include: [
            {
                association: 'roles',
                include: [
                    {
                        association: 'permissions'
                    }
                ]
            }
        ]
    });

    if (!user) return null;

    const sessionUser: SessionUser = {
        ...(user as SessionUser),
        roles: user.roles?.map(role => role.name) || [],
        permissions: user.roles?.flatMap(role => role.permissions?.map(permission => `${permission.resource}.${permission.action}`) || []) || []
    };

    return sessionUser;
}