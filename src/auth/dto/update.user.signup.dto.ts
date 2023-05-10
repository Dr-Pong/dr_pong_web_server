import { ProfileImage } from "src/domain/profile-image/profile-image.entity";
import { User } from "../../domain/user/user.entity";

export class UpdateUserSignUpDto {
	user: User;
	profileImage: ProfileImage;
	nickname: string;
}