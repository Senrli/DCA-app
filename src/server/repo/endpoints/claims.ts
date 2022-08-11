import { Request, Router } from 'express';
import debug from 'debug';
import { Claim, ClaimModel } from '../models/claims';
import { GalleryNewIcon } from '@fluentui/react-northstar';

const router = Router();
const log = debug('msteams');

export const queryClaimbyUser = async (userId: string) => {
  const claims = await ClaimModel.find().or([{ 'creator.userId': userId }, { 'approver.userId': userId }, { 'requestor.userId': userId }]);
  return claims;
};

export const queryClaimbyId = async (caseId: string) => {
  const claims = await ClaimModel.findOne({ caseId });
  return claims;
};

export const createClaim = async (newClaim: Claim) => {
  const createClaimRet = await ClaimModel.create(newClaim);
  return createClaimRet;
};

export const updateClaim = async (newClaim: Claim) => {
  const currentClaim = await queryClaimbyId(newClaim.caseId);
  if (!currentClaim) {
    log(`unable to find existing calim, will create a new one!`);
    const createClaimRet = await createClaim(newClaim);
    return createClaimRet;
  } else {
    Object.keys(newClaim).forEach((element) => {
      currentClaim[element] = newClaim[element];
    });
    await currentClaim.save();
    return currentClaim;
  }
};

router.post('/claims', async (req: Request<unknown, unknown, Claim>, res) => {
  log(`Create claim`);
  try {
    const newClaimRet = await createClaim(req.body);
    res.status(200).send(newClaimRet);
  } catch (error) {
    log('POST /claims error');
    log(error.stack);
    res.status(500).send(error);
  }
});

router.get('/claims/id', async (req: Request<unknown, unknown, Claim>, res) => {
  log('Retrieval claims by id');
  try {
    const user = await queryClaimbyId(req.body.caseId);
    log(`caseId: ${req.body.caseId}`);
    res.status(200).send(user);
  } catch (error) {
    log('GET /claims/id error');
    log(error.stack);
    res.status(500).send(error);
  }
});

router.get('/claims/user', async (req, res) => {
  log('Retrieval claims by user');
  try {
    const user = await queryClaimbyUser(req.body.userId);
    log(`userid: ${req.body.userId}`);
    res.status(200).send(user);
  } catch (error) {
    log('GET /claims/user error');
    log(error.stack);
    res.status(500).send(error);
  }
});

router.patch('/claims', async (req, res) => {
  log('Update claims');
  try {
    const update = await updateClaim(req.body);
    res.status(200).send(update);
  } catch (error) {
    log('PATCH /claims error');
    log(error.stack);
    res.status(500).send(error);
  }
});

export default {
  router,
  queryClaimbyUser,
  queryClaimbyId,
  createClaim,
  updateClaim
};
