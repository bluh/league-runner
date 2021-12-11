import { Request, Response } from 'jest-express';
import roleUtils from '../src/utils/role';
import databaseUtils from '../src/utils/database';
import league from '../src/api/league';

var req, res;

jest.mock('utils/role');
jest.mock('utils/database');

beforeEach(() => {
  req = new Request();
  res = new Response()
})

afterEach(() => {
  res.resetMocked();
})

describe('GET /api/leagues', () => {
  test('Success', () => {
    req.setSignedCookies(roleUtils.__generateToken());
  
    const dbData = {
      LeagueID: 0,
      LeagueName: '',
      LeagueDescription: '',
      LeagueRoleID: 0,
      LeagueRole: 0,
    }
  
    const expectedData = {
      id: 0,
      name: '',
      description: '',
      roleId: 0,
      role: 0,
    };
  
    databaseUtils.__setDbData([dbData]);
    
    var isError = false;
  
    return league.methods.getUserLeagues(req, res)
      .catch(() => isError = true)
      .finally(() => {
        expect(isError).toBe(false);
        expect(res.json).toBeCalledWith([expectedData]);
        expect(res.status).toBeCalledWith(200);
      })
  })
  
  test('Failed: No User', () => {
    var isError = false;
  
    return league.methods.getUserLeagues(req, res)
      .catch(() => isError = true)
      .finally(() => {
        expect(isError).toBe(true);
      })
  })
})

describe('GET /api/league/{queen}/queens', () => {
  test('Success', () => {
    req.setParams({
      queenID: 0
    });
    
    const dbData = {
      EpisodeID: 0,
      EpisodeNumber: 0,
      QueenID: 0,
      QueenName: 0,
      Points: 0
    }
  
    const expectedData = {
      episodeID: 0,
      episodeNumber: 0,
      queenID: 0,
      queenName: 0,
      points: 0
    };
  
    var isError = false;
  
    databaseUtils.__setDbData([dbData]);
  
    return league.methods.getQueensInLeague(req, res)
      .catch(() => isError = true)
      .finally(() => {
        expect(isError).toBe(false);
        expect(res.status).toBeCalledWith(200);
        expect(res.json).toBeCalledWith([expectedData]);
      });
  })
})

describe('GET /api/league/:leagueID', () => {
  test('Success', () => {
    req.setParams({ leagueID: 1 });
    
    const dbData = {
      ID: 0,
      Name: "",
      Description: ""
    }
  
    const expectedData = {
      id: 0,
      name: "",
      description: ""
    };
  
    var isError = false;
  
    databaseUtils.__setDbData([dbData]);

    return league.methods.getLeague(req, res)
      .catch(() => isError = true)
      .finally(() => {
        expect(isError).toBe(false);
        expect(res.status).toBeCalledWith(200);
        expect(res.json).toBeCalledWith([expectedData]);
      })
  })

  test('Failure: No LeagueID', () => {
    var isError = false;

    return league.methods.getLeague(req, res)
      .catch(() => isError = true)
      .finally(() => {
        expect(isError).toBe(true);
        expect(res.status).toBeCalledWith(400);
      })
  })
})