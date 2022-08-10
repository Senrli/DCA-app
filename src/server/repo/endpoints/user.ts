import { User, UserModel } from '../models/user';
import { Request, Router } from 'express';
import debug from 'debug';

const log = debug('msteams');

const router = Router();

export const queryUserbyId = async (userId: string) => {
  const user = await UserModel.findOne({ userId });
  log(`queryuserbyid result: ${user}`);
  return user;
};

export const createNewUser = async (newUser: User) => {
  const createUser = await UserModel.create(newUser);
  return createUser;
  // if (!queryUserbyId(newUser.userId)) {

  // } else {
  //   throw new Error('User Exists!');
  // }
};

export const UpdateUserInfo = async (newUserData: User) => {
  const currentUserInfo = await queryUserbyId(newUserData.userId);
  if (!currentUserInfo) {
    log(`Unable to find existing user info, creating a new user!`);
    const newUser = await createNewUser(newUserData);
    return newUser;
  } else {
    Object.keys(newUserData).forEach((element) => {
      currentUserInfo[element] = newUserData[element];
    });
    await currentUserInfo.save();
    return currentUserInfo;
  }
};

/** Returns user reference
 */
router.get('/users', async (req: Request<unknown, unknown, User>, res) => {
  log('Retrieval users');
  try {
    const user = await queryUserbyId(req.body.userId);
    res.status(200).send(user);
  } catch (error) {
    log('GET /users error');
    log(error.stack);
    res.status(500).send(error);
  }
});

/** Delete user entry */
router.delete('/users', async (req, res) => {
  log('Delete users');
  log('Not implemented');
  try {
    res.status(404).send('No item found');
  } catch (error) {
    res.status(500).send(error);
  }
});

/** Create new user entry */
router.post('/api/users', async (req: Request<unknown, unknown, User>, res) => {
  log('Create users');
  try {
    const newUser = await createNewUser(req.body);
    res.status(200).send(newUser);
  } catch (error) {
    log('POST /users error');
    log(error.stack);
    res.status(500).send(error);
  }
});

/** Update user entry */
router.patch('/api/users', async (req: Request<unknown, unknown, User>, res) => {
  log('Update users');
  try {
    const Update = await UpdateUserInfo(req.body);
    res.status(200).send(Update);
  } catch (error) {
    res.status(500).send(error);
  }
});

export default {
  queryUserbyId,
  createNewUser,
  UpdateUserInfo,
  router
};
