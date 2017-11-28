
--[[
    示例 : print(utils.Vector3_one() * 2)    

    utils.Vector3(x, y, z) * scale
]]
local Vector3 = gf.utils.class2(function(self, x, y, z)
    self.x = x or 0
    self.y = y or 0
    self.z = z or 0
end)

function Vector3:ctor()
    print("vector  ctor")
end

-- vec1 + vec2
function Vector3:__add(rhs)
    return Vector3(self.x + rhs.x, self.y + rhs.y, self.z + rhs.z)
end

-- vec1 - vec2
function Vector3:__sub(rhs)
    return Vector3(self.x - rhs.x, self.y - rhs.y, self.z - rhs.z)
end

-- vec1 * vec2
function Vector3:__mul(rhs)
    return Vector3(self.x * rhs, self.y * rhs, self.z * rhs)
end

-- vec1 / vec2
function Vector3:__div(rhs)
    return Vector3(self.x / rhs, self.y / rhs, self.z / rhs)
end

function Vector3:__tostring()
    return string.format("(%2.2f, %2.2f, %2.2f)", self.x, self.y, self.z) 
end

-- vec1 == vec2
function Vector3:__eq(rhs)
    return self.x == rhs.x and self.y == rhs.y and self.z == rhs.z
end

function Vector3:Dot(rhs)
    return self.x * rhs.x + self.y * rhs.y + self.z * rhs.z
end

function Vector3:Cross(rhs)
    return Vector3(self.y * rhs.z - self.z * rhs.y,
                   self.z * rhs.x - self.x * rhs.z,
                   self.x * rhs.y - self.y * rhs.x)
end

function Vector3:LengthSq()
    return (self.x*self.x + self.y*self.y + self.z*self.z)
end

function Vector3:Length()
    return math.sqrt(self:LengthSq())
end

function Vector3:GetNormalized()
    return (self / self:Length())
end

function Vector3:Get()
    return self.x, self.y, self.z
end

function Vector3:Set(x,y,z)
    self.x = x or 0
    self.y = y or 0
    self.z = z or 0
end






Vector3_Instance = Vector3_Instance or {}

----static function
-- 两个向量的夹角
function Vector3_Instance.AngleBetween(lhs, rhs)
    local radangle =  math.acos(math.clamp(Vector3.Dot(lhs:GetNormalized(), rhs:GetNormalized()), -1, 1))
    return math.deg(radangle)
end

-- 两个向量叉乘
function Vector3_Instance.Cross(lhs, rhs)
    return Vector3(lhs.y * rhs.z - lhs.z * rhs.y,
                   lhs.z * rhs.x - lhs.x * rhs.z,
                   lhs.x * rhs.y - lhs.y * rhs.x)
end

-- 两个向点叉乘
function Vector3_Instance.Dot(lhs, rhs)
    return (lhs.x * rhs.x + lhs.y * rhs.y + lhs.z * rhs.z)
end

-- 拷贝当前向量  长度不超过maxlength
function Vector3_Instance.ClampMagnitude(Targeths, maxLength) 
    if (Targeths:LengthSq()) > (maxLength * maxLength) then
        return Targeths:GetNormalized() * maxLength
    else
        return Targeths
    end
end

-- 两个点距离
function Vector3_Instance.Distance(lhs, rhs)
    local tempVec = Vector3(lhs.x - rhs.x, lhs.y - rhs.y, lhs.z - rhs.z)
    return math.sqrt(tempVec.x * tempVec.x + tempVec.y * tempVec.y + tempVec.z * tempVec.z)
end

--[[
    --线性插值 (0,1)之间 
    https://keithmaggio.wordpress.com/2011/02/15/math-magician-lerp-slerp-and-nlerp/
    https://github.com/topameng/CsToLua/blob/master/tolua/Assets/Lua/Vector3.lua
]]
function Vector3_Instance.Lerp(from, to, percent)
    local t = math.clamp(percent, 0, 1)

    -- -- from * (1-t) + (to * t)  下面的公式与这个公式等价
    return (from + (to - from) * t)
end

-- 弧形插值
function Vector3_Instance.Slerp(from, to, t)
    local len2 	= to:Length()
    local len1 	= from:Length()	
    local len 	= (len2 - len1) * t + len1
    
    from = from:GetNormalized()
    to = to:GetNormalized()
    
    local dot = Vector3_Instance.Dot(from, to)    
	local omega = math.acos(dot)
    local sinom = math.sin(omega)
    local scale0 = math.sin((1 - t) * omega) / sinom
    local scale1 = math.sin(t * omega) / sinom
    
    return (from * scale0 + to * scale1) * len
end

-- 当前的地点移向目标
function Vector3_Instance.MoveTowards(current, target, maxDistance)
    local vector3 = target - current
    local Length  = vector3:Length()
    if (Length <= maxDistance ) or (Length == 0) then
        return target 
    else
        return (current + vector3 / Length * maxDistanceDelta)
    end
end

function Vector3_Instance.Slerp2(from, to, t)
	local omega, sinom, scale0, scale1

	if t <= 0 then		
		return from
	elseif t >= 1 then		
		return to
	end
	
	local v2 	= to
	local v1 	= from
	local len2 	= to:Length()
	local len1 	= from:Length()	
	v2 = v2 / len2
	v1 = v1 / len1

	local len 	= (len2 - len1) * t + len1
	local cosom = Vector3_Instance.Dot(v1, v2)
	
	if 1 - cosom > 1e-6 then
		omega 	= math.acos(cosom)
		sinom 	= math.sin(omega)
		scale0 	= math.sin((1 - t) * omega) / sinom
		scale1 	= math.sin(t * omega) / sinom
	else 
		scale0 = 1 - t
		scale1 = t
	end

	v1 = v1 * scale0
	v2 = v2 * scale1
	v2 = v2 + v1
	return  v2 * len	
end

--平滑阻尼
--current 当前位置      
--target 试图接近的位置
--currentVelocity 当前速度
--smoothtime 到达目标大约的时间
--maxSpeed 限制的最大速度
--涉及到Time.deltaTime
function Vector3_Instance.SmoothDamp(current, target, currentVelocity, smoothtime, maxspeed)
  
end

--当前向量转向向量
function Vector3_Instance.RotateTowards(from, to, maxRadiansDelta, maxMagnitudeDelta)
    local dot = Vector3_Instance.Dot(from:GetNormalized(), to:GetNormalized())
	local angle = math.acos(dot)			
	local theta = math.min(angle, maxRadiansDelta)
	local v2 = Vector3_Instance.Slerp(from, to, theta/angle)
	v2:GetNormalized()
	return (Vector3_Instance.ClampMagnitude(v2,maxMagnitudeDelta))
end

--正交归一
function Vector3_Instance.OrthoNormalize(va, vb, vc)
    va = va:GetNormalized()
    vb = Vector3_Instance.ProjectOnPlane(va, vb)
    vb = vb:GetNormalized()
        
    if vc == nil then
        return va, vb
    end
        
    vc = Vector3_Instance.ProjectOnPlane(va, vc)
    vc = Vector3_Instance.ProjectOnPlane(vb, vc)

    vc = vc:GetNormalized()

    return va, vb, vc
end

--反射
function Vector3_Instance.Reflect(inDirection, inNormal) 
    return  inNormal * (-2 * Vector3_Instance.Dot(inNormal, inDirection)) + inDirection
end

--x,y,z缩放
function Vector3_Instance.Scale(lhs,rhs)
    Vector3(lhs.x *rhs.x, lhs.y *rhs.y, lhs.z *rhs.z)
end

---投影到向量上
function Vector3_Instance.Project(vector, onNormal)
    local num = Vector3_Instance.Dot(onNormal, onNormal)
    return (onNormal * Vector3_Instance.Dot(vector, onNormal) / num)
end

--投影到面上
function Vector3_Instance.ProjectOnPlane(excludeThis, onNormal)
    return (onNormal - Vector3_Instance.Project(onNormal, excludeThis))
end




function Vector3_Instance.Min( lhs,  rhs) 
    return Vector3d(math.min(lhs.x, rhs.x), math.min(lhs.y, rhs.y), math.min(lhs.z, rhs.z))
end

function Vector3_Instance.Min( lhs,  rhs) 
    return Vector3d(math.max(lhs.x, rhs.x), math.max(lhs.y, rhs.y), math.max(lhs.z, rhs.z))
end


utils.Vector3 = Vector3
utils.Vector3_Instance = Vector3_Instance

-- https://docs.unity3d.com/ScriptReference/Vector3.html
function Vector3_Instance.one()
    return Vector3(1, 1, 1)
end

function Vector3_Instance.zero()
    return Vector3(0, 0, 0)
end

function Vector3_Instance.up()
    return Vector3(0, 1, 0)
end

function Vector3_Instance.down()
    return Vector3(0, -1, 0)
end

function Vector3_Instance.left()
    return Vector3(-1, 0, 0)
end

function Vector3_Instance.right()
    return Vector3(1, 0, 0)
end

function Vector3_Instance.back()
    return Vector3(0, 0, -1)
end

function Vector3_Instance.forward()
    return Vector3(0, 0, 1)
end




