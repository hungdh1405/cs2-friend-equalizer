// Vietnamese-language template pools for the Discord bot's own channel messages — distinct
// from server/utils/changelog-messages.ts, which is the English-language admin/audit feed
// shown on the website's /changelog page. Placeholders are substituted by
// server/utils/discord-notify.ts using the same `{key}` syntax as changelog.ts's `render()`.
// Picked pseudo-randomly per message so the channel doesn't read like a repetitive bot log.

// Voter is linked to a roster Player with S or A tier — distinctly hype-ier wording that
// name-drops their tier, framing them as a difference-maker for the match.
export const VOTE_CAST_VIP = [
  '🔥 {name} (hạng {tier}) vừa xác nhận tham gia! Có {name} là kèo này auto lên trình.',
  '⭐ Tin nóng: {name} - hạng {tier} - đã vào kèo! Đối thủ nghe tên chắc run tay.',
  '💪 {name} hạng {tier} chốt tham gia rồi! Cầm chắc phần thắng trong tay.',
  '🎯 VIP xuất hiện: {name} (hạng {tier}) đã in team! Trận này chất lượng tăng vọt.',
  '👑 {name} - top hạng {tier} - vừa tham gia! Anh em còn chờ gì nữa, vào nốt đi.',
  '🚀 {name} hạng {tier} đã bấm nút! Có carry rồi, lo gì nữa.',
  '🏆 Báo tin vui: {name} (hạng {tier}) tham gia trận này! Kèo thơm không tưởng.',
  '💎 Hàng xịn về: {name} hạng {tier} đã xác nhận! Team nào có {name} coi như nửa thắng.',
  '⚡ {name} - hạng {tier} - tham gia rồi! Tốc độ và sức mạnh đã hội tụ.',
  '🔥 Không phải dạng vừa: {name} hạng {tier} vừa vào kèo. Đối thủ nên lo lắng.',
  '🎮 {name} (hạng {tier}) đã sẵn sàng! Có tay to như vầy, trận này khó thua.',
  '👑 Ông trùm {name} hạng {tier} góp mặt! Kèo này chốt luôn không cần suy nghĩ.',
  '🌟 {name} hạng {tier} tham gia làm trận đấu sáng bừng lên. Ai còn chưa vào thì nhanh tay.',
  '💥 Bomb tấn: {name} (hạng {tier}) đã in! Đối thủ chuẩn bị tinh thần đi là vừa.',
  '🔥 {name} hạng {tier} chốt đơn! Team này auto có động lực chiến hết mình.',
  '🎯 Chuẩn không cần chỉnh: {name} - hạng {tier} - đã tham gia. Kèo ngon phải nắm bắt.',
  '👑 {name} hạng {tier} xuất trận! Nghe tên là biết trận này nghiêm túc rồi.',
  '💪 Cỗ máy chiến thắng {name} (hạng {tier}) đã vào kèo! Ai cùng team quá may mắn.',
  '⭐ {name} hạng {tier} tham gia - báo động đỏ cho mọi đối thủ trong server.',
  '🚀 {name} (hạng {tier}) đã xác nhận! Đẳng cấp là mãi mãi, kèo này phải xem.',
  '🔥 Săn kèo VIP: {name} hạng {tier} vừa vào team, khỏi cần lo skill nữa.',
  '👑 Cả server rung chuyển: {name} hạng {tier} chính thức tham gia trận này.',
  '💎 Ngọc quý xuất hiện: {name} (hạng {tier}) đã in kèo. Trận này đáng để hóng.',
  '⚡ Tia sét {name} hạng {tier} vừa đánh xuống danh sách tham gia! Đối thủ lo là đúng.',
  '🎯 {name} hạng {tier} khóa slot thành công! Kèo này chốt chất từ đây.',
  '🏆 Nhà vô địch tiềm năng {name} (hạng {tier}) đã tham gia. Chờ gì mà chưa hype lên.',
  '🔥 Cấp độ {tier} như {name} mà cũng tham gia thì kèo này auto căng.',
  '💪 {name} hạng {tier} nhận lời tham chiến! Cẩn thận đối thủ, cẩn thận.',
  '🌟 Ánh sáng từ hạng {tier} {name} vừa chiếu vào trận đấu tuần này.',
  '👑 {name} hạng {tier} chính thức góp mặt - một chữ ký đáng giá cho team nào có được.'
]

// Everyone else — B/C/D tier, or not linked to a roster profile at all. Casual, friendly.
export const VOTE_CAST_NORMAL = [
  '✅ {name} đã tham gia trận này rồi nha.',
  '👍 {name} vào kèo! Cảm ơn đã join.',
  '🎮 {name} xác nhận tham gia. Còn ai nữa không?',
  '✅ Ghi nhận: {name} chơi trận này.',
  '👋 {name} đã bấm nút tham gia rồi đó.',
  '🙌 {name} vào team! Full slot còn xa không ta.',
  '✅ {name} in kèo. Cùng chờ đủ người thôi.',
  '🎯 {name} đã tham gia. Kèo càng đông càng vui.',
  '👍 Thêm một chân: {name} tham gia trận này.',
  '✅ {name} chốt tham gia rồi, khỏi lo thiếu người.',
  '🙋 {name} giơ tay tham gia! Cảm ơn nhiệt tình.',
  '✅ {name} vào slot. Trận này thêm một mảnh ghép.',
  '👋 Chào {name}, đã ghi nhận bạn tham gia trận này.',
  '🎮 {name} sẵn sàng chiến! Đã có mặt trong danh sách.',
  '✅ {name} tham gia thành công. Đợi thêm vài người nữa.',
  '👍 {name} in! Kèo này đang dần đủ người.',
  '🙌 {name} đã tham gia. Cố lên anh em, còn thiếu vài suất.',
  '✅ Nhận diện: {name} chơi trận tuần này.',
  '🎯 {name} tham gia rồi đó, ai chưa vào thì nhanh tay.',
  '👋 {name} đã có mặt trong danh sách tham gia.',
  '✅ {name} xác nhận đi trận. Cảm ơn bạn nhé.',
  '🙌 Cảm ơn {name} đã dành thời gian tham gia trận này.',
  '✅ {name} có mặt! Danh sách đang dài thêm ra.',
  '👍 {name} chốt kèo. Một suất nữa đã được lấp đầy.',
  '🎮 {name} đã bấm tham gia, hẹn gặp trong trận đấu.',
  '✅ {name} vào danh sách rồi, cứ yên tâm chuẩn bị nhé.',
  '👋 Xin chào {name}, rất vui vì bạn tham gia trận này.',
  '🙋 {name} góp mặt! Trận đấu thêm phần rôm rả.',
  '✅ {name} đã tham gia, mong sớm đủ người để chốt kèo.',
  '🎯 Slot mới đã có chủ: {name} tham gia trận này.'
]

// Someone clicked "Không tham gia được" — no VIP distinction. Warm and encouraging on
// purpose, never guilt-tripping: they're not obligated to play, and a "miss you, see you
// next time" tone keeps the channel friendly. Once declined, they're excluded from future
// vote-reminder tags for this event (see server/tasks/discord/voteReminder.ts) — this is the
// only message they'll get about it, so it should send them off on a good note.
export const VOTE_DECLINED = [
  '💙 {name} tuần này không tham gia được. Hẹn gặp lại ở kèo sau nhé!',
  '👋 {name} vắng mặt trận này. Nhớ bạn rồi, mong tuần sau có mặt!',
  '🍀 {name} bận rồi, thôi để tuần sau chiến tiếp. Giữ sức khỏe nhé!',
  '💙 Tiếc quá, {name} không đi được kèo này. Hẹn trận sau nha!',
  '🌟 {name} nghỉ trận này. Cảm ơn đã báo trước, hẹn gặp lại sớm!',
  '👋 Không có {name} trận này buồn thật, nhưng hẹn tuần sau đông đủ nhé.',
  '💙 {name} tạm vắng kèo này. Mong mọi thứ ổn, chờ bạn quay lại!',
  '🤗 {name} không tham gia được lần này, không sao cả — kèo sau nhớ ghé nha!',
  '🍀 Ghi nhận {name} nghỉ trận này. Chúc bạn mọi việc thuận lợi!',
  '👋 {name} báo bận rồi, tuần sau ráng sắp xếp tham gia nhé!',
  '💙 Thiếu {name} trận này nhưng không sao, hẹn gặp ở kèo tới!',
  '🌟 {name} vắng mặt lần này. Cảm ơn đã cho biết sớm, hẹn lần sau!',
  '🤗 {name} nghỉ kèo này. Mong bạn nghỉ ngơi tốt, hẹn tuần sau chiến!',
  '💙 {name} không đi được trận này, tụi mình sẽ nhớ bạn đó!',
  '👋 Được rồi {name}, hẹn kèo sau vậy nhé. Chúc mọi thứ suôn sẻ!',
  '🍀 {name} báo không tham gia được. Cảm ơn đã cho biết, hẹn gặp lại!',
  '🌟 {name} tạm nghỉ trận này. Đội hình sẽ chờ bạn ở tuần sau!',
  '💙 Không có {name} thì hơi thiếu vui, nhưng hẹn kèo tới nha!',
  '🤗 {name} vắng mặt lần này rồi. Mong bạn ổn, hẹn sớm gặp lại!',
  '👋 {name} không tham gia được, ghi nhận rồi. Tuần sau đợi bạn nhé!',
  '💙 {name} nghỉ trận này. Cảm ơn đã báo, hy vọng sớm thấy bạn lại!',
  '🍀 Rất tiếc thiếu {name} kỳ này, nhưng chắc chắn sẽ có kèo sau!',
  '🌟 {name} bận việc riêng rồi. Không sao, hẹn gặp ở trận kế tiếp!',
  '🤗 {name} không đi được kèo này. Mong bạn khỏe, hẹn tuần sau nhé!',
  '💙 Cảm ơn {name} đã báo sớm. Kèo sau nhớ tham gia lại nha!',
  '👋 {name} vắng trận này, nhưng anh em vẫn luôn chờ bạn quay lại.',
  '🍀 {name} tạm gác kèo này. Chúc mọi điều tốt lành, hẹn lần sau!',
  '🌟 Thiếu {name} lần này thật đó, mong tuần sau có bạn góp mặt!',
  '🤗 {name} không tham gia được, không vấn đề gì cả. Hẹn gặp lại sớm!',
  '💙 {name} nghỉ trận tuần này. Cảm ơn đã cho biết, chúc bạn vui vẻ!'
]

// Mentions all current Hosts, reminds them to schedule this week's event.
export const HOST_REMINDER = [
  '📅 {hosts} ơi, tuần này chưa có kèo nào được tạo cả. Lên lịch giúp mọi người nhé!',
  '⏰ Nhắc nhẹ {hosts}: tuần này còn thiếu một trận đấu đó. Tạo kèo sớm cho anh em vote đi.',
  '📅 {hosts} chưa set kèo cho tuần này, mọi người đang đợi đấy.',
  '⏰ Này {hosts}, tuần mới rồi mà chưa thấy kèo đâu. Tạo giúp cái nào!',
  '📅 Nhắc {hosts}: hãy tạo trận đấu cho tuần này để mọi người đăng ký tham gia.',
  '⏰ {hosts} ơi, anh em đang ngóng kèo tuần này lắm rồi.',
  '📅 Tuần này vẫn trống lịch. {hosts} tạo kèo giúp nhé, mọi người sẵn sàng vote luôn.',
  '⏰ {hosts}, đến giờ tạo kèo rồi đó. Đừng để anh em chờ lâu.',
  '📅 Chưa có trận nào cho tuần này. {hosts} setup giúp cái là mọi người vào vote ngay.',
  '⏰ Nhắc nhở nhẹ {hosts}: kèo tuần này vẫn chưa xuất hiện trên hệ thống.',
  '📅 {hosts} ơi, thời gian không chờ đợi ai. Tạo kèo cho tuần này đi nào.',
  '⏰ Ping {hosts}: cần một kèo mới cho tuần này để mọi người bắt đầu vote.',
  '📅 {hosts}, lịch tuần này đang trống trơn. Chốt ngày giờ giúp anh em với.',
  '⏰ Này {hosts}, chưa có kèo tuần này thì lấy gì mà vote đây.',
  '📅 {hosts} tạo kèo giúp đi, mọi người đang chờ để xác nhận tham gia.',
  '⏰ Nhắc {hosts} lần nữa: tuần này cần một trận đấu mới nhé.',
  '📅 {hosts} ơi, không có kèo thì cả server buồn lắm đó. Tạo giúp nào!',
  '⏰ Đến lúc rồi {hosts}: setup trận đấu tuần này cho mọi người tham gia.',
  '📅 {hosts}, hãy chốt ngày giờ chơi tuần này giúp anh em nhé.',
  '⏰ Gọi {hosts}: tuần này chưa có kèo, mọi người đang chờ tin từ bạn.',
  '📅 {hosts} setup kèo sớm nhé, để anh em còn kịp sắp xếp thời gian tham gia.',
  '⏰ {hosts} ơi, mỗi ngày trôi qua là một ngày ít cơ hội tổ chức trận đấu hơn.',
  '📅 Thông báo {hosts}: hệ thống chưa ghi nhận trận đấu nào cho tuần này.',
  '⏰ {hosts}, cả nhóm đang chờ một cái kèo. Nhấn nút tạo sự kiện giúp cái.',
  '📅 {hosts} nhớ tạo kèo tuần này nha, đừng để mọi người phải hỏi lại.',
  '⏰ Nhắc khéo {hosts}: chưa có lịch thì anh em chẳng biết khi nào tụ tập.',
  '📅 {hosts}, một trận đấu mới đang chờ được tạo ra từ tay bạn.',
  '⏰ {hosts} ơi, đến hẹn lại lên - tạo kèo tuần này thôi nào.',
  '📅 Không thấy kèo đâu cả {hosts}. Mọi người trông cả vào bạn đó.',
  '⏰ {hosts}, tuần này im ắng quá vì chưa có trận đấu nào được lên lịch.'
]

// Vote reminders (3x/day). Every URGENT/CLOSE template includes {mentions} — the specific
// roster players (linked to a Discord account) who haven't voted yet, tagged directly so
// the reminder reaches exactly who still needs to act, not the whole server. If there is
// nobody left to tag (every linked player has already voted, or nobody's linked at all),
// discord-notify.ts renders {mentions} as an empty string and sends with allowed_mentions:
// { parse: [] } instead — never falls back to tagging everyone.
export const VOTE_REMINDER_URGENT = [
  '📢 Hiện mới có {count} người tham gia, còn thiếu khá nhiều đó! {mentions} vào vote giúp nhé: {link}',
  '🙏 Cần thêm {remaining} người nữa mới đủ kèo. {mentions} ơi, đừng để trận này tan vì thiếu người: {link}',
  '📢 Kèo tuần này đang thiếu {remaining} suất. {mentions} tham gia giúp nào: {link}',
  '⚠️ Mới có {count} người xác nhận, cần gấp thêm người. {mentions} xem chi tiết tại: {link}',
  '📢 Còn thiếu {remaining} người mới đủ trận. {mentions} ơi, vào vote đi: {link}',
  '🙏 Trận này đang cần thêm người lắm, còn thiếu {remaining} suất. {mentions} giúp một tay: {link}',
  '📢 Chỉ mới {count} người, kèo có nguy cơ tan. {mentions} vào tham gia ngay tại: {link}',
  '⚠️ {mentions} ơi, mọi người đang chờ các bạn vote để đủ {remaining} suất còn thiếu: {link}',
  '📢 Danh sách còn trống nhiều lắm. {mentions} tham gia giúp anh em nhé: {link}',
  '🙏 {mentions}, trận tuần này cần các bạn - hiện chỉ mới {count} người xác nhận: {link}'
]

export const VOTE_REMINDER_CLOSE = [
  '👀 Chỉ còn thiếu {remaining} người nữa là đủ kèo rồi! {mentions} vào vote luôn: {link}',
  '🔥 Gần đủ rồi, thiếu {remaining} suất nữa thôi. {mentions} nhanh tay tham gia: {link}',
  '👀 Còn {remaining} người là kèo full! {mentions} xem chi tiết tại: {link}',
  '🔥 Sắp đủ người rồi, chỉ cần thêm {remaining} nữa. {mentions} tham gia ngay: {link}',
  '👀 {count} người đã vào, chỉ thiếu {remaining} suất cuối. {mentions} đừng bỏ lỡ: {link}',
  '🔥 Gần chốt kèo rồi! {mentions} cần thêm các bạn để đủ {remaining} người: {link}',
  '👀 Sắp đủ, còn {remaining} suất trống. {mentions} còn do dự gì nữa: {link}',
  '🔥 {mentions} ơi, chỉ cần các bạn vote là đủ {remaining} suất cuối cùng: {link}',
  '👀 Kèo đang rất gần đủ người, thiếu {remaining} nữa. {mentions} chốt luôn nhé: {link}',
  '🔥 Chặng cuối rồi! {mentions} vào vote để hoàn tất {remaining} suất còn thiếu: {link}'
]

export const VOTE_REMINDER_ENOUGH = [
  '✅ Đã đủ {count} người cho trận này rồi! Ai muốn tham gia thêm vẫn chào đón: {link}',
  '🎉 Kèo đã full người, cảm ơn mọi người đã tham gia. Xem danh sách tại: {link}',
  '✅ Đủ {count} người tham gia rồi, trận đấu chắc chắn diễn ra! Chi tiết: {link}',
  '🎉 Đã đạt số lượng cần thiết. Ai vào thêm thì vẫn được chào đón nhé: {link}',
  '✅ {count} người đã sẵn sàng cho trận này. Xem ai tham gia tại: {link}',
  '🎉 Kèo đã đủ người, chuẩn bị tinh thần chiến đấu thôi! Chi tiết: {link}',
  '✅ Trận này đã đủ {count} người, không còn gì phải lo lắng nữa: {link}',
  '🎉 Đội hình đã đủ, giờ chỉ còn chờ ngày thi đấu. Xem thêm: {link}',
  '✅ {count} người đã góp mặt, kèo tuần này coi như chắc chắn: {link}',
  '🎉 Đủ người tham gia rồi, cảm ơn cả nhà đã nhiệt tình: {link}'
]

// The ≥10-votes team-split announcement, listing both generated teams.
export const TEAM_READY = [
  '🎉 Đã đủ người tham gia! Team đã được chia ngẫu nhiên, sẵn sàng chiến thôi:\n{teams}',
  '🏆 Full slot rồi! Đây là đội hình được chia cho trận này:\n{teams}',
  '🎮 Đủ người rồi anh em! Hai team đã lên sẵn:\n{teams}',
  '🔥 Kèo đã đủ, chia team xong luôn! Xem đội hình:\n{teams}',
  '🎉 Chốt đội hình cho trận tuần này:\n{teams}',
  '🏆 Team đã sẵn sàng, chuẩn bị vào trận:\n{teams}',
  '🎮 Đã đủ {count} người, hai team được chia như sau:\n{teams}',
  '🔥 Danh sách team đã có, không cần chờ thêm nữa:\n{teams}',
  '🎉 Trận này chính thức đủ người, đội hình như sau:\n{teams}',
  '🏆 Đội hình ngẫu nhiên cho trận tuần này đã lên:\n{teams}',
  '🎮 Full team rồi, chia đội xong xuôi:\n{teams}',
  '🔥 Anh em xem đội hình được chia cho kèo này nhé:\n{teams}',
  '🎉 Đủ người, đủ đội, chỉ còn chờ ngày đấu:\n{teams}',
  '🏆 Team đã chốt, giờ chỉ cần chiến thắng thôi:\n{teams}',
  '🎮 Đội hình đã sẵn sàng cho trận đấu tuần này:\n{teams}',
  '🔥 Chia team xong, ai cũng có phần trong trận này:\n{teams}',
  '🎉 Team được chia tự động, công bằng cho cả hai bên:\n{teams}',
  '🏆 Đây là hai đội cho trận đấu sắp tới:\n{teams}',
  '🎮 Sẵn sàng chưa? Team đã lên, chờ gì mà không luyện tay:\n{teams}',
  '🔥 Đủ người tham gia, đội hình được chốt như sau:\n{teams}',
  '🎉 Không cần chờ thêm, đội hình chính thức đã có:\n{teams}',
  '🏆 Trận đấu tuần này đã có đủ hai team so kè:\n{teams}',
  '🎮 Chia đội xong, giờ chỉ còn đếm ngày ra trận:\n{teams}',
  '🔥 Cân bằng lực lượng đã hoàn tất cho cả hai bên:\n{teams}',
  '🎉 Đội hình được xáo trộn ngẫu nhiên nhưng vẫn cân tài cân sức:\n{teams}',
  '🏆 Team A và Team B đã điểm danh đầy đủ:\n{teams}',
  '🎮 Đủ 2 đội cho trận cầu tuần này, xem ai chung team với ai:\n{teams}',
  '🔥 Không khí chiến đấu đã lên, đội hình đã chốt:\n{teams}',
  '🎉 Random đội hình xong, giờ chỉ còn thi đấu hết mình:\n{teams}',
  '🏆 Hai team ngang tài ngang sức đã được lập:\n{teams}'
]

// Some voters aren't linked to a roster Player yet — announced instead of TEAM_READY, and
// naming who needs linking.
export const NEED_DISCORD_LINK = [
  '⚠️ {hosts} ơi, đã đủ {count} người tham gia nhưng chưa thể chia team vì còn thiếu liên kết Discord cho: {names}. Vào trang quản lý cập nhật giúp nhé.',
  '⚠️ Đủ người rồi, nhưng {names} chưa được liên kết với hồ sơ trên hệ thống. {hosts} cập nhật giúp để chia team nhé.',
  '⚠️ {hosts}, cần liên kết Discord ID cho {names} thì mới chia được đội hình. Giúp cập nhật sớm nhé!',
  '⚠️ Đã đủ số lượng tham gia, nhưng còn thiếu thông tin của {names} trên hệ thống. {hosts} vào cập nhật giúp.',
  '⚠️ {hosts} ơi, {names} chưa có Discord ID trong hồ sơ nên chưa random được team. Cập nhật giúp nhé.',
  '⚠️ Đủ {count} người tham gia rồi, nhưng thiếu liên kết cho {names}. {hosts} bổ sung giúp để chia đội.',
  '⚠️ {hosts}, hệ thống cần Discord ID của {names} để tính đúng trình khi chia team.',
  '⚠️ Sắp có team rồi, chỉ còn thiếu liên kết hồ sơ cho {names}. {hosts} cập nhật giúp nhé.'
]

// A Host canceled the current event — rare, so a smaller pool is fine, same as
// NEED_DISCORD_LINK above. Posted to the channel and the event message is edited to remove
// the vote buttons (see discord-embeds.ts / events/current.delete.ts).
export const EVENT_CANCELED = [
  '📢 Sự kiện tuần này đã bị hủy. Hẹn mọi người vào tuần sau nhé!',
  '❌ Kèo tuần này không diễn ra — sự kiện đã bị hủy.',
  '📢 Đã hủy sự kiện tuần này. Theo dõi kênh để biết lịch mới nhé.',
  '❌ Rất tiếc, trận tuần này bị hủy. Hẹn gặp lại ở kèo sau.',
  '📢 Sự kiện đã được hủy bởi Host. Không cần vote nữa nhé.',
  '❌ Kèo tuần này đã dừng lại giữa đường. Chờ thông báo mới.'
]

// Posted right after a Host creates the week's event — a hype announcement distinct from
// the embed+buttons message itself (same pattern as vote-cast/removed getting their own
// message on top of the live-updating embed). Credits/tags *all* current Hosts — the
// website's shared-PIN create flow doesn't know which specific Host clicked the button, so
// rather than tag no one, every Host gets credited/pinged collectively.
export const EVENT_CREATED = [
  '🎉 {hosts} đã lên kèo tuần này: {startsAt}! Vào vote ngay: {link}',
  '📅 {hosts} vừa tạo sự kiện mới cho tuần này — {startsAt}. Vào vote nhé: {link}',
  '🔥 {hosts} chốt kèo rồi! Trận tuần này diễn ra lúc {startsAt}. Bấm nút vote ở trên nhé.',
  '📢 {hosts} vừa tạo sự kiện tuần này: {startsAt}. Xem chi tiết và vote tại: {link}',
  '🎮 {hosts} đã setup kèo mới — {startsAt}. Đừng quên vote nha anh em!',
  '📅 {hosts} lên lịch cho tuần này rồi: {startsAt}. Ai đi được thì tham gia sớm nhé.',
  '🔥 {hosts} chốt giờ đấu tuần này: {startsAt}! Vote ngay ở tin nhắn phía trên.',
  '🎉 Cảm ơn {hosts} đã tạo kèo! {startsAt}. Xem thêm và xác nhận tham gia tại: {link}',
  '📢 {hosts} thông báo: sự kiện tuần này sẽ diễn ra vào {startsAt}. Vào vote thôi!',
  '🎮 {hosts} đã có lịch tuần này: {startsAt}. Ai chưa vote thì tranh thủ nhé.',
  '🔥 {hosts} setup kèo cho {startsAt} rồi. Chờ gì mà chưa vote?',
  '📅 {hosts} vừa tạo sự kiện mới: {startsAt}. Chi tiết đầy đủ tại: {link}',
  '🎉 {hosts} đã chốt kèo — {startsAt}! Ai tham gia thì lên tiếng nhé.',
  '📢 {hosts} vừa lên lịch cho tuần này, diễn ra lúc {startsAt}.',
  '🎮 {hosts} đã setup kèo tuần này: {startsAt}. Vote ngay để không bị quên!',
  '🔥 {hosts} hẹn mọi người vào {startsAt} — sự kiện đã được tạo, vote thôi!',
  '📅 {hosts} vừa lên lịch trận tuần này: {startsAt}. Xem ai đã tham gia tại: {link}',
  '🎉 {hosts} vừa chốt xong lịch — {startsAt}! Nhanh tay vote để giữ chỗ.',
  '📢 {hosts} thông báo kèo tuần này chính thức lên sóng vào {startsAt}.',
  '🎮 {hosts} đã có lịch chơi tuần này: {startsAt}. Xác nhận tham gia ở nút phía trên nhé.',
  '🔥 {hosts} báo tin: trận tuần này diễn ra lúc {startsAt} — đừng bỏ lỡ, vote ngay!',
  '📅 {hosts} đã lên kế hoạch cho tuần này: {startsAt}. Chi tiết tại: {link}',
  '🎉 {hosts} vừa tạo kèo ngon: {startsAt}. Vào vote để chốt số lượng nhé!',
  '📢 Cập nhật từ {hosts}: sự kiện tuần này sẽ bắt đầu lúc {startsAt}.',
  '🎮 {hosts} lên lịch xong rồi — {startsAt}! Ai tham gia thì bấm nút vote nhé.'
]
