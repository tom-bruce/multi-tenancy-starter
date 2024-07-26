// interface IUserService {
//   byId(id: string): UserDTO | null;
//   teams(id: string): Array<TeamDTO>; // This should have more info about the actual membership - should this be a seperate DTO just for the user service? This method might be better on the TeamService
// }

// class UserService implements IUserService {
//   constructor(private _userRepo: IUserRepository) {}
//   byId(id: string): UserDTO | null {
//     return this._userRepo.byId(id);
//   }
//   teams(id: string) {
//     return [];
//   }
// }

// interface TeamDTO {
//   id: string;
//   name: string;
// }

// interface TeamMemberDTO {
//   userId: string;
//   email: string; // This will come from the user table, is this ok as it couples the members to users in the db?
// }

// // This would be an aggregate root that countains the members entity?
// interface ITeamService {
//   create(name: string): TeamDTO;
//   delete(id: string): void; // assert member is admin
//   members(teamId: string): Array<TeamMemberDTO>;
//   invite(email: string): TeamMemberDTO;
//   revokeInvite(email: string): void; // Not invited error
// }

// (async function main() {})();
