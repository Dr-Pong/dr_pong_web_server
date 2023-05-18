import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
      where: { season: { id: nowSeason.id } },
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
      where: { season: { id: nowSeason.id } },
      take: getDto.count,
      skip: getDto.offset - 1,
      order: { ladderPoint: 'DESC' },
    });
  }

  //** 래더 포인트로 순위 조회 */
  async findRankByLadderPoint(userId: number): Promise<number> {
    const userRank = await this.repository
      .createQueryBuilder('rank')
      .select('COUNT(*) + 1', 'ranking')
      .where(
        'rank.ladder_point > (SELECT ladder_point FROM rank WHERE id = :id)',
        { id: userId },
      )
      .getRawOne();

    const ranking = Number(userRank.ranking);

    return ranking;
  }
}
