export async function checkVipExpiry(supabase, user) {
  if (!user.is_vip || !user.vip_expiry) return user
  if (new Date(user.vip_expiry) > new Date()) return user

  await supabase
    .from('users')
    .update({ is_vip: false, vip_expiry: null })
    .eq('id', user.id)

  return { ...user, is_vip: false, vip_expiry: null }
}
