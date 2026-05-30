# Compatibility shim for Ruby 3.2+ which removed Object#tainted?
# Required by Liquid 4.0.3 used in github-pages / Jekyll 3.9
class Object
  def tainted?
    false
  end unless method_defined?(:tainted?)
end
