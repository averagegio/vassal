# PRD: Fealty Court (Vassal × X)

**Status:** Draft  
**Product:** Vassal — AI landlords for fans and freeholds  
**Surface:** Fan Court (mobile-first)  
**Owner intent:** Gamify social service under a Lord; grow the Lord; raise ranks; unlock spoils (brand/podcast) without spam or ToS abuse.

---

## 1. Problem

Small accounts want proximity to larger ones. Large accounts want loyal growth help and deal leverage. Existing “pay for follow / engagement pod” patterns are spammy and break platform rules. Vassal needs a **fealty system** that turns real service into ranks and shared spoils.

## 2. One-liner

**Swear fealty. Serve the season. Rise in rank. Share the spoils.**

Lords recruit vassals → vassals complete season quests (replies / reposts / mentions) → ranks rise → court milestones unlock brand/podcast spoils — Steward drafts, Lord seals.

## 3. Goals / non-goals

**Goals**

- Mobile thumb-loop for vassals: see quest → serve → unlock boon  
- Lord can invite, set season targets, approve outbound in under a minute  
- Measurable growth of the Lord via attributed, capped service  
- Clear ladder Baron → Duke  
- Spoils board for court-level brand/podcast campaigns  

**Non-goals (v1)**

- Buying/selling follows  
- Cold mass DMs  
- Steward posting *as* the Lord  
- Automatic skim of X Creator Revenue deposits  
- Estate / real-estate holding features in this PRD  

## 4. Roles

| Role | Who | Can |
|------|-----|-----|
| Lord | Larger account with a court | Invite vassals, author seasons, approve drafts/pins/spoils |
| Vassal | Smaller account in a court | Accept invite, pick boon, serve quest, climb ranks |
| Steward | AI agent | Suggest invites/quests, draft replies, score seasons, never impersonate |

## 5. Core loop

```
Lord invites vassal (link ± approved X post)
  → Vassal signup/login (X) joins court
  → Picks boon + accepts season quest
  → Serves: replies / reposts / mentions (scored)
  → Thresholds unlock boons; XP feeds ranks
  → Court milestone → Spoils board (brand / podcast)
  → Lord approves external outreach; retinue shares success
```

## 6. Mobile screens (v1)

### Vassal

1. **Home** — court name, rank badge, next boon, season countdown  
2. **Quest** — three progress rings: Replies · Reposts · Mentions; “next unlock” line  
3. **Serve now** — one suggested Lord post + editable Steward draft → open X / copy  
4. **Retinue** — mini leaderboard (standing this season)  
5. **Spoils** — locked/unlocked milestones (read-only until open)  

### Lord

1. **Court** — vassal count, season progress, pending approvals badge  
2. **Invite** — paste handle / share link  
3. **Season** — sliders for reply / repost / mention targets + boon map  
4. **Approve** — swipe queue: draft reply, pin candidate, spoils pitch  

**UX bar:** primary vassal action (“Serve now”) completable in ≤30 seconds one-handed.

## 7. Season math (default template)

**Duration:** 30 days  

**Default targets** (Steward scales by Lord followers later):

| Action | Target | Notes |
|--------|--------|--------|
| Replies on Lord’s posts | 60 | Cap 3 scored replies / Lord post / day |
| Reposts of Lord’s posts | 20 | Cap 5 / day |
| Mentions of Lord + season code | 15 | Must include season tag/code |

**Quality rails (acceptance criteria)**

- [ ] Ignore replies under 20 characters or emoji-only  
- [ ] Cap scored actions per post and per day  
- [ ] Bonus XP if Lord likes/replies to vassal’s reply  
- [ ] Mentions without season code do not count  
- [ ] Muted/blocked accounts never score  

**Boon thresholds (example map)**

| Unlock | Boon |
|--------|------|
| 20 replies | Retinue list seat |
| 8 reposts | Named in weekly favor decree |
| 5 mentions | Pin-reply rotation eligibility |
| Full clear | Rank XP pack + spoils % bump |
| Top 3 leaderboard | Bonus landing plot on `/court` |

## 8. Rank table

Court rank under one Lord (not global fame):

| Rank | Requirement (v1) | Perks |
|------|------------------|-------|
| Serf | Invited, not sworn | View quest |
| Baron | First season ≥50% clear | List seat eligible |
| Count | 1 full season clear | Decree name priority |
| Viscount | 2 seasons clear OR 1× top-3 | Pin rotation weight ↑ |
| Duke | 3 seasons clear + Lord seal | Spoils cut ↑; may nominate sub-vassals (v2) |

Standing decays if a season is abandoned (no scored actions in 14 days) → boons pause, not delete history.

## 9. Spoils (endgame, still ToS-safe)

**Unlock when** court hits a milestone (configurable), e.g.:

- +N attributed engaged follows in a season, **or**  
- M vassals fully clear the season  

**Spoils board items:** podcast pitch, brand intro, collab ask  

**Rules**

- Steward drafts only; Lord approves every external send  
- Vassals help via research, angle drafts, sharing *their own* graph — no cold spam blasts  
- Payout = court spoils pool / success fee on Vassal (not a claim on X’s wallet)  
- Split example: Lord 70% · top contributing vassals 20% · Vassal platform 10%  

## 10. X / ToS rules (acceptance criteria)

- [ ] No marketplace for follows or follow-backs  
- [ ] No automated cold DMs  
- [ ] No Steward posts using the Lord’s identity  
- [ ] All X writes go through Lord approve queue + rate limits  
- [ ] Quest copy forbids “spam every post”; Serve now suggests one action at a time  
- [ ] In-app rule card: “Service, not spam” shown at oath accept  
- [ ] Store refresh tokens only with explicit reconnect; revoke on logout  

**Scopes (phased)**

- Now: `users.read`, `tweet.read`, `offline.access`  
- When approve-queue ships: add write scopes as needed for lists / replies (Lord-connected only)

## 11. Data sketch (v1)

- `courts` — lord_user_id, handle, season_active_id  
- `court_members` — court_id, user_id, rank, standing, joined_at  
- `invites` — token, court_id, nominated_handle, status  
- `seasons` — court_id, targets JSON, boon_map JSON, starts_at, ends_at  
- `season_scores` — season_id, user_id, replies, reposts, mentions, xp  
- `boon_grants` — user_id, season_id, boon_key, granted_at  
- `spoils_milestones` / `spoils_items` — court campaigns + status  
- Extend X: store encrypted refresh token + scope set on user  

## 12. Build wedge (ship order)

1. Invite link → signup binds `court_id`  
2. Season template + 3 progress rings + Serve now (draft only / open X)  
3. Score sync (read API / manual reconcile OK at first) + boon grants  
4. Rank seals on decree feed  
5. Lord approve queue  
6. Spoils milestone (manual catalog OK)  

## 13. Success metrics

- Invite → sworn conversion  
- % vassals with ≥1 scored action / week  
- Season clear rate  
- Lord approve latency (target &lt; 24h)  
- Spam reports / blocks after Serve now (should stay ~0)  
- Spoils milestones unlocked / quarter  

## 14. Open questions

- Default Lord pricing: sub only vs success fee only vs both?  
- Can a user serve in multiple courts in v1? (Recommend: one primary court)  
- Duke sub-vassals in v1 or v2? (Recommend: v2)  
- Attribution for “engaged follow”: bio link only vs promo codes vs both?

---

*Fealty over spam. Ranks over rented followers. Spoils over empty reach.*
