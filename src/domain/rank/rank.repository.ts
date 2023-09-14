import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { Rank } from './rank.entity';
import { GetRanksTopDto } from './dto/get.ranks.top.count.dto';
import { GetRanksBottomDto } from './dto/get.ranks.bottom.dto';
import { Season } from 'src/domain/season/season.entity';

@Injectable()
export class RankRepository {
  constructor(
    @InjectRepository(Rank)
    private readonly repository: Repository<Rank>,
  ) {}

  //**유저 시즌 랭크 조회 */
  async findByUserIdAndSeasonId(
    userId: number,
    seasonId: number,
  ): Promise<Rank> {
    return await this.repository.findOne({
      where: { user: { id: userId }, season: { id: seasonId } },
    });
  }

  //**유저 최고 랭크 조회 */
  async findHighestRankByUserId(userId: number): Promise<Rank> {
    return await this.repository.findOne({
      where: { user: { id: userId } },
      order: { highestPoint: 'ASC' },
    });
  }

  //**유저들 상위 랭크 조회 */
  async findTopRanksBySeason(
    getDto: GetRanksTopDto,
    nowSeason: Season,
  ): Promise<Rank[]> {
    return await this.repository.find({
      where: {
        season: { id: nowSeason.id },
        ladderPoint: MoreThanOrEqual(1000),
      },
      take: getDto.count,
      order: { ladderPoint: 'DESC' },
    });
  }

  //**유저들 상위 랭크 다음 랭크 조회 */
  async findBottomRanksBySeason(
    getDto: GetRanksBottomDto,
    nowSeason: Season,
  ): Promise<Rank[]> {
    return await this.repository.find({
      where: {
        season: { id: nowSeason.id },
        ladderPoint: MoreThanOrEqual(+process.env.DOCTOR_CUT),
      },
      take: getDto.count,
      skip: getDto.offset - 1,
      order: { ladderPoint: 'DESC' },
    });
  }

  async findRankingByUserIdAndSeasonId(
    userId: number,
    seasonId: number,
  ): Promise<number> {
    const query = `
    SELECT user_id, ranking
    FROM (
      SELECT user_id, ROW_NUMBER() OVER (ORDER BY ladder_point DESC) as ranking
      FROM "rank"
      WHERE (season_id = $1 AND ladder_point >= 1000)
      LIMIT 200
    ) ranking
    WHERE user_id = $2
  `;
    const userRank = (
      await this.repository.query(query, [seasonId, userId])
    )[0];

    const ranking = Number(userRank.ranking);

    return ranking;
  }

  async update(
    userId: number,
    seasonId: number,
    userLp: number,
    userHighestLp: number,
  ): Promise<void> {
    await this.repository.update(
      { user: { id: userId }, season: { id: seasonId } },
      {
        ladderPoint: userLp,
        highestPoint: userHighestLp,
      },
    );
  }

  async save(userId: number, seasonId: number): Promise<void> {
    await this.repository.save({
      user: { id: userId },
      season: { id: seasonId },
      ladderPoint: 1000,
      highestPoint: 1000,
    });
  }
}
